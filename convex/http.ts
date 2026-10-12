import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/paddle-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadText = await request.text();
    
    try {
      const parsedEvent = JSON.parse(payloadText);
      await ctx.runMutation(internal.debugLogs.logWebhook, {
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
          await ctx.runMutation(internal.users.unlockPro, {
            email: email
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
