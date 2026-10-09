import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/whop-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadText = await request.text();
    
    try {
      // Parse early just for logging
      const parsedEvent = JSON.parse(payloadText);
      await ctx.runMutation(internal.whop.logWebhook, {
        action: parsedEvent.type || parsedEvent.action || "unknown",
        payload: parsedEvent
      });
    } catch(e) {
      // Ignored if not JSON
    }

    // Whop uses x-whop-signature header
    const signature = request.headers.get("x-whop-signature") || request.headers.get("whop-signature");
    if (!signature) {
      console.error("Webhook rejected: Missing signature header");
      // return new Response("Missing signature", { status: 400 });
    }

    console.log("Received Whop Webhook:", payloadText);
    
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    if (!secret) {
      console.error("WHOP_WEBHOOK_SECRET is missing in environment variables!");
    }
    
    if (secret && signature) {
      try {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          enc.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign", "verify"]
        );
        
        const signatureBuffer = await crypto.subtle.sign(
          "HMAC",
          key,
          enc.encode(payloadText)
        );
        
        const signatureHex = Array.from(new Uint8Array(signatureBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
          
        if (signatureHex !== signature) {
          console.error(`Whop webhook signature mismatch! Expected: ${signatureHex}, Got: ${signature}`);
        } else {
          console.log("Signature verified successfully.");
        }
      } catch (e) {
        console.error("Error verifying signature:", e);
      }
    }

    try {
      const event = JSON.parse(payloadText);
      const eventType = event.type || event.action;
      console.log("Parsed Webhook Event Type:", eventType);
      
      const validActions = [
        "membership.went_valid", 
        "membership.went_invalid",
        "membership.activated",
        "member.created",
        "payment.succeeded",
        "order.created"
      ];
      
      if (validActions.includes(eventType)) {
        // Aggressively hunt for the email anywhere in the Whop payload
        const email = 
          event.data?.user?.email || 
          event.data?.customer?.email || 
          event.data?.member?.email || 
          event.data?.email;
          
        console.log("Extracted Email from Webhook:", email);
        
        if (email) {
          // If the event is any of these success events, the status is valid
          const isSuccessEvent = [
            "membership.went_valid",
            "membership.activated", 
            "payment.succeeded",
            "order.created",
            "member.created"
          ].includes(eventType);

          await ctx.runMutation(internal.whop.handleWebhook, {
            email: email,
            status: isSuccessEvent ? "valid" : "invalid",
            subscriptionId: event.data?.id
          });
          console.log(`Successfully triggered handleWebhook for ${email} with status ${isSuccessEvent ? "valid" : "invalid"}`);
        } else {
          console.error("Could not find email in the Whop payload:", event.data);
        }
      }
      
      return new Response("Webhook processed", { status: 200 });
    } catch (err) {
      console.error("Webhook processing error:", err);
      return new Response("Internal Error", { status: 500 });
    }
  }),
});

http.route({
  path: "/paddle-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadText = await request.text();
    
    try {
      const parsedEvent = JSON.parse(payloadText);
      await ctx.runMutation(internal.whop.logWebhook, {
        action: "PADDLE_" + (parsedEvent.event_type || "unknown"),
        payload: parsedEvent
      });
      
      // We are looking for transaction.completed
      if (parsedEvent.event_type === "transaction.completed") {
        // Paddle lets you pass customData in the checkout overlay
        // We passed the email in customData!
        const email = parsedEvent.data?.custom_data?.email || parsedEvent.data?.customer?.email;
        const transactionId = parsedEvent.data?.id;
        
        if (email) {
          await ctx.runMutation(internal.whop.handleWebhook, {
            email: email,
            status: "valid",
            subscriptionId: transactionId
          });
          console.log(`[Paddle] Unlocked user: ${email}`);
        } else {
          console.error("[Paddle] No email found in custom_data or customer!");
        }
      }
      
      return new Response("OK", { status: 200 });
    } catch (e) {
      console.error("[Paddle] Webhook Error:", e);
      return new Response("Internal Error", { status: 500 });
    }
  })
});

export default http;
