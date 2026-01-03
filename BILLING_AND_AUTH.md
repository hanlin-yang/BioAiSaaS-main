# Authentication & Payment Integration Guide

This document provides detailed implementation guidance for BioAiSaaS production authentication and payment systems.

---

## Overview

The BioAiSaaS production system implements a comprehensive authentication and payment infrastructure that integrates with the agent orchestration layer. This ensures secure user access and automated billing based on agent task execution.

### Key Features

- **Dual Authentication**: Email (Supabase) + WeChat OAuth
- **Dual Payment Channels**: WeChat Pay + Alipay
- **Flexible Billing**: Outcome-based or Token-based
- **Smart Authorization**: Micro-payment auto-authorization
- **Deep Integration**: Payment metering coupled with agent task execution

---

## Authentication System

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Auth Flow                        │
│                                                               │
│  ┌─────────────┐        ┌──────────────┐                   │
│  │  Email      │        │   WeChat     │                   │
│  │  Login      │        │   Login      │                   │
│  └──────┬──────┘        └──────┬───────┘                   │
│         │                      │                             │
│         ▼                      ▼                             │
│  ┌─────────────────────────────────────┐                   │
│  │    Auth State Management (React)    │                   │
│  └─────────────┬───────────────────────┘                   │
└────────────────┼────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Auth Services                     │
│                                                               │
│  ┌──────────────────┐       ┌──────────────────┐           │
│  │  Supabase Auth   │       │  WeChat OAuth    │           │
│  │  (Email/OTP)     │       │  Handler         │           │
│  └────────┬─────────┘       └─────────┬────────┘           │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       ▼                                     │
│           ┌────────────────────────┐                       │
│           │  Session Management    │                       │
│           │  JWT Token Issuer      │                       │
│           └────────────┬───────────┘                       │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Supabase Database   │
              │  - users table       │
              │  - sessions table    │
              └──────────────────────┘
```

### 1. Email Authentication (Supabase)

#### Frontend Implementation

```typescript
// lib/api/auth.ts
import { supabase } from './supabase';

export async function signInWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      shouldCreateUser: true,
    },
  });
  
  if (error) {
    throw new Error(`Email login failed: ${error.message}`);
  }
  
  return data;
}

export async function verifyOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  
  if (error) {
    throw new Error(`OTP verification failed: ${error.message}`);
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

#### Auth Callback Handler

```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // Redirect to dashboard
  return NextResponse.redirect(new URL('/agent', requestUrl.origin));
}
```

### 2. WeChat OAuth Authentication

#### Backend OAuth Handler (FastAPI)

```python
# backend/auth/wechat.py
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import RedirectResponse
import httpx
import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth/wechat", tags=["auth"])

WECHAT_APP_ID = os.getenv("WECHAT_APP_ID")
WECHAT_APP_SECRET = os.getenv("WECHAT_APP_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL")
JWT_SECRET = os.getenv("JWT_SECRET")

@router.get("/")
async def wechat_login():
    """Redirect to WeChat OAuth page"""
    redirect_uri = f"{FRONTEND_URL}/auth/wechat/callback"
    auth_url = (
        f"https://open.weixin.qq.com/connect/qrconnect?"
        f"appid={WECHAT_APP_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=snsapi_login&"
        f"state=STATE#wechat_redirect"
    )
    return RedirectResponse(url=auth_url)

@router.get("/callback")
async def wechat_callback(code: str, state: str):
    """Handle WeChat OAuth callback"""
    
    # Exchange code for access_token
    async with httpx.AsyncClient() as client:
        token_response = await client.get(
            "https://api.weixin.qq.com/sns/oauth2/access_token",
            params={
                "appid": WECHAT_APP_ID,
                "secret": WECHAT_APP_SECRET,
                "code": code,
                "grant_type": "authorization_code",
            }
        )
        token_data = token_response.json()
    
    if "errcode" in token_data:
        raise HTTPException(
            status_code=400,
            detail=f"WeChat auth failed: {token_data.get('errmsg')}"
        )
    
    access_token = token_data["access_token"]
    openid = token_data["openid"]
    unionid = token_data.get("unionid")  # May not be present
    
    # Get user info
    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            "https://api.weixin.qq.com/sns/userinfo",
            params={
                "access_token": access_token,
                "openid": openid,
            }
        )
        user_data = user_response.json()
    
    # Create or update user in Supabase
    from supabase import create_client
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for admin access
    )
    
    # Check if user exists
    result = supabase.table("users").select("*").eq("wechat_openid", openid).execute()
    
    if not result.data:
        # Create new user
        user = supabase.table("users").insert({
            "wechat_openid": openid,
            "wechat_unionid": unionid,
            "nickname": user_data.get("nickname"),
            "avatar_url": user_data.get("headimgurl"),
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
        user_id = user.data[0]["id"]
    else:
        # Update existing user
        user_id = result.data[0]["id"]
        supabase.table("users").update({
            "nickname": user_data.get("nickname"),
            "avatar_url": user_data.get("headimgurl"),
            "last_login": datetime.utcnow().isoformat(),
        }).eq("id", user_id).execute()
    
    # Generate JWT
    jwt_payload = {
        "user_id": user_id,
        "openid": openid,
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    jwt_token = jwt.encode(jwt_payload, JWT_SECRET, algorithm="HS256")
    
    # Redirect to frontend with token
    redirect_url = f"{FRONTEND_URL}/auth/wechat/success?token={jwt_token}"
    return RedirectResponse(url=redirect_url)
```

#### Frontend WeChat Auth Flow

```typescript
// app/auth/wechat/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';

export default function WeChatAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store JWT token
      localStorage.setItem('wechat_jwt', token);
      
      // Optionally sync with Supabase session
      // (requires custom backend endpoint)
      
      // Redirect to dashboard
      router.push('/agent');
    } else {
      router.push('/login?error=wechat_auth_failed');
    }
  }, [searchParams, router]);
  
  return <div>Processing WeChat login...</div>;
}
```

---

## Payment System

### Payment Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Frontend                                  │
│  ┌────────────────┐    ┌─────────────────┐                  │
│  │ Cost Estimator │ →  │ Payment Dialog  │                  │
│  └────────────────┘    └────────┬────────┘                  │
└──────────────────────────────────┼───────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                  Backend Payment Service                      │
│                                                               │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐ │
│  │ Pre-Order    │ →  │ QR Code Gen   │ →  │ Callback     │ │
│  │ Creation     │    │ (WeChat/Ali)  │    │ Handler      │ │
│  └──────────────┘    └───────────────┘    └──────┬───────┘ │
└─────────────────────────────────────────────────────┼─────────┘
                                                      │
                                                      ▼
                                           ┌──────────────────┐
                                           │  Supabase DB     │
                                           │  - payments      │
                                           │  - agent_runs    │
                                           │  - users         │
                                           └──────────────────┘
```
