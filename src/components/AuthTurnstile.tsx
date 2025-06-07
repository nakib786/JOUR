'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

interface AuthTurnstileProps {
  onSuccess: (token: string) => void;
  onError: () => void;
  onExpire: () => void;
}

export interface AuthTurnstileRef {
  reset: () => void;
}

export const AuthTurnstile = forwardRef<AuthTurnstileRef, AuthTurnstileProps>(
  ({ onSuccess, onError, onExpire }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
      },
    }));

    return (
      <div className="flex justify-center">
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
          onSuccess={onSuccess}
          onError={onError}
          onExpire={onExpire}
        />
      </div>
    );
  }
);

AuthTurnstile.displayName = 'AuthTurnstile'; 