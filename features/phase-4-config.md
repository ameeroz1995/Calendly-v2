# Phase 4: Firebase Configuration

## Goal
RTDB security rules that enforce authorization at server level. Project config for hosting + emulators.

## Files

### task-028: `database.rules.json`

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "event_types": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "availability": {
      "$hostId": {
        ".read": "true",
        "$date": {
          "$slotId": {
            ".write": "auth != null && (data.child('status').val() === 'free' || $hostId === auth.uid)"
          }
        }
      }
    },
    "calendar_connections": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "booking_rules": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "bookings": {
      "$bookingId": {
        ".read": "auth != null && (data.child('hostId').val() === auth.uid || data.child('inviteeId').val() === auth.uid)",
        ".write": "auth != null"
      }
    },
    "routing_forms": {
      "$fid": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "routing_pools": {
      "$pid": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "routing_counters": {
      "$pid": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "workspaces": {
      "$wid": {
        ".read": "auth != null && (data.child('hostId').val() === auth.uid || data.child('clientId').val() === auth.uid)",
        ".write": "auth != null && (data.child('hostId').val() === auth.uid || data.child('clientId').val() === auth.uid)"
      }
    },
    "secure_phi": {
      "$bookingId": {
        ".read": "auth != null && (root.child('bookings').child($bookingId).child('hostId').val() === auth.uid || root.child('bookings').child($bookingId).child('inviteeId').val() === auth.uid)",
        ".write": "auth != null && root.child('bookings').child($bookingId).child('inviteeId').val() === auth.uid"
      }
    },
    "webhook_subscriptions": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "api_keys": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

### task-029: `firebase.json`

```json
{
  "database": {
    "rules": "database.rules.json"
  },
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "features/**",
      "*.md"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "database": {
      "port": 9000
    },
    "auth": {
      "port": 9099
    },
    "hosting": {
      "port": 5000
    }
  }
}
```

## Verification
1. Deploy rules: `firebase deploy --only database`
2. Test unauthenticated read → denied
3. Test user reading another user's data → denied
4. Test slot booking: write to free slot → allowed, write to booked slot → denied
5. Test PHI access: invitee can write PHI, host can read PHI, third party denied
6. Hosting: navigate to any path → loads index.html (SPA rewrite)
