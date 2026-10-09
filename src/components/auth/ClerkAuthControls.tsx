import React from 'react';
import { SignInButton, SignUpButton, Show, UserButton, useUser } from '@clerk/react';

export const ClerkAuthControls: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[#E8DDD3] bg-white text-[#5F3E29] hover:bg-[#F3E7DA] transition-colors cursor-pointer shadow-2xs">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#8B5E3C] text-white hover:bg-[#6D492F] transition-colors shadow-2xs cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </Show>

      <Show when="signed-in">
        <div className="flex items-center gap-2.5">
          {user?.firstName && (
            <span className="hidden sm:inline-block text-xs font-semibold text-[#5F3E29]">
              {user.firstName}
            </span>
          )}
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-8 h-8 rounded-full border border-[#E8DDD3] shadow-2xs',
              },
            }}
          />
        </div>
      </Show>
    </div>
  );
};
