## **Architectural Deconstruction of Calendly's Technology Stack**

The infrastructure of modern scheduling automation relies on continuous, bi-directional calendar synchronization across diverse API ecosystems.1 Calendly's core platform is built on Google Cloud Services (GCS), utilizing certified data centers that comply with SOC 2 Type II and ISO 27001 standards.1 To establish calendar connections without compromising credential security, the platform utilizes OAuth 2.0 authentication protocols for major providers, including Google Workspace and Microsoft Graph.1 This approach replaces the storage of raw passwords with secure, revocable access tokens that are regularly rotated to minimize exposure.1 For legacy environments, such as on-premise Microsoft Exchange servers, the system deploys a local Outlook plug-in that transmits encrypted availability data over secure, outbound TLS SHA-256 connections with RSA keys.1  
A key engineering principle of this calendar integration is data minimization.1 The platform restricts its queries to check only busy-or-free status, event start and end times, and duration.1 This design ensures that sensitive meeting details—such as attendee names, locations, and descriptions—remain unread, unless explicitly authorized by the user.1  
This strict focus on data minimization led to the decision to phase out Apple iCloud Calendar integrations in August 2024\.1 Because iCloud relies on an "all-or-nothing" permission structure that requires full calendar read-and-write access, it directly conflicted with the platform's security policies, leading to its removal.1

                  \+--------------------------------+  
                  |    Calendly GCS Core Engine    |  
                  \+---------------+----------------+  
                                  |  
         \+------------------------+------------------------+  
         | (OAuth 2.0 Protocol)                            | (Local TLS Utility)  
         v                                                 v  
\+--------+--------+                               \+--------+--------+  
| Google/Microsoft|                               | On-Prem Exchange|  
| Cloud Calendars |                               | Outlook Plug-in |  
\+-----------------+                               \+-----------------+

Beyond calendar syncing, the scheduling engine manages complex, multi-host event distribution through several core event structures:

* **Round-Robin Routing**: Distributes incoming bookings across a pool of hosts based on customizable distribution rules, such as equal allocation or agent priority.3  
* **Collective Scheduling**: Cross-checks the availability of multiple internal hosts to offer only time slots where all required team members are simultaneously free.3  
* **Group Scheduling**: Allows multiple external participants to book slots within a single, shared event, which is ideal for webinars or training sessions.4

To secure these booking channels against fraud, spam, and social engineering, the platform runs an active, three-tier threat scanning engine that evaluates all shared booking links against global reputation databases 1:

| Security Scan Level | System Assessment | Platform Action and Friction Enforcement |
| :---- | :---- | :---- |
| **Safe Link** | Cleared through standard threat databases. | Instant, uninterrupted access to the booking page.1 |
| **Suspicious Link** | Flagged for anomalous creation patterns or unverified domains. | Intercepts the user with an intermediate warning screen, requiring confirmation before proceeding.1 |
| **Dangerous Link** | Verified as malicious, phishing, or a social engineering threat. | Blocks direct click-through; requires the user to manually copy and paste the URL to access.1 |

To improve workflow automation, the platform connects with key business systems through its integrations directory.5 For CRM systems like HubSpot, the platform automatically enriches contact records when meetings are booked, creating new leads or logging activity notes.6 For sales team performance, it integrates with Gong Engage to trigger review workflows.5 Recruiters can connect the platform with Greenhouse ATS to automate candidate interview scheduling.5  
Collaborative workflows are supported through Slack and Microsoft Teams Chat integrations, which send automated notifications to keep team members aligned.5 Additionally, developer integrations with tools like Claude AI let users schedule meetings programmatically through conversational interfaces.5

## **Strategic Pricing Model and Competitive Landscape Analysis**

The platform uses a tiered software-as-a-service (SaaS) subscription model designed to grow with users from solo plans to large enterprise deployments.7 To support growing teams, the platform offers volume-based discounts on its Teams plan for annual subscribers.10

| Subscription Tier | Billed Annually | Billed Monthly | Target Audience | Primary Included Feature Set | Key Exclusions and Limits |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Free** | $0 | $0 | Solo users with basic booking needs.7 | 1 active event type, 1 calendar connection, and basic video tool integrations.7 | Mandatory platform branding, no team scheduling, and no payment collection.7 |
| **Standard** | $10 per seat / month | $12 per seat / month | Individual professionals and small teams.7 | Unlimited event types, 6 calendar connections per user, branding removal, Stripe/PayPal payment gateway integrations, and customizable email reminders.7 | No round-robin routing, collective scheduling, routing forms, or advanced enterprise CRM integrations.9 |
| **Teams** | $16 per seat / month (base rate) | $20 per seat / month | Growing businesses and collaborative teams.7 | Round-robin and collective scheduling, qualification routing forms, Salesforce and HubSpot CRM sync, and automated workflows.7 | Volume pricing discounts apply only at higher seat tiers.10 |
| **Enterprise** | Custom (starts at $15,000 / year) | Custom | Large organizations requiring advanced governance.7 | SAML SSO, SCIM user provisioning, domain verification, advanced security audits, data retention policies, MS Dynamics 365, and premium customer support.7 | Requires custom sales negotiation and a high annual commitment.7 |

For organizations on the annual Teams plan, the volume-based pricing structure lowers the cost per seat as the deployment size increases.10

  Annual Cost per Seat ($)  
    |  
 16 |=========  
14.5|                     \=========  
 14 |                                           \=========  
13.5|                                                                   \=========  
 13 |                                                                                           \=========  
 12 |                                                                                                                   \=========  
    \+----------------------------------------------------------------------------------------------------------------------------- Seats

The mathematical formula for the annual cost function ![][image1] for a team of ![][image2] seats is calculated using tiered rates 10:  
![][image3]  
This volume-tiered approach ensures that as companies scale, their average cost per user decreases, encouraging platform adoption across larger departments.10  
When compared to its primary competitor, Cal.com, Calendly's free tier is significantly more restrictive.8 Cal.com provides advanced features, such as unlimited active event types, multiple calendar connections, workflow builders, and payment integrations, for free.8 This difference highlights Calendly's reliance on its brand equity and enterprise ecosystem to retain users, even as open-source competitors offer more features at lower tiers.8

## **Analytical Assessment of Deficiencies, Market Gaps, and Regulatory Obstacles**

An analysis of user feedback across platforms like G2, Capterra, and Reddit reveals several functional limits and operational friction points.11  
A major barrier is the platform's non-compliance with the Health Insurance Portability and Accountability Act (HIPAA).14 Because the platform does not execute a Business Associate Agreement (BAA), healthcare organizations cannot use it to handle Protected Health Information (PHI).14 Any workflow that links a patient's identity with diagnostic labels, specific provider specialties, or custom symptom forms violates HIPAA rules.15 While healthcare providers can use the platform for internal staff meetings or non-clinical administrative workflows, managing patient scheduling requires switching to specialized platforms like Qwil or Healthie.17

                     \+----------------------------+  
                     |    Calendly Booking (0h)   |  
                     \+--------------+-------------+  
                                    |  
                                    v  
                                    |  
                     \+--------------+-------------+  
                     | Manual Tool Fragmentation  |  
                     \+-----+--------+--------+----+  
                           |        |        |  
                           v        v        v  
                      \[Asana\]     \[Harvest\]

Another major friction point is the "post-booking cliff".11 The platform's operational role ends once an event is written to the calendar.11 It lacks native tools for task delegation, deliverable tracking, ongoing client communication, and post-meeting documentation.11 Once a meeting concludes, users must manually move action items into separate tools like Asana or Monday.com, and log billable hours in software like Toggl or Harvest.11 This disconnect prevents service providers from linking booking data directly to post-meeting deliverables or client history.11  
Furthermore, the platform's payment engine does not support advanced billing models like deposits, installment plans, or automated retainer subscriptions.11 Users charging for ongoing services must set up external billing systems via Stripe billing or specialized accounting tools.11  
European enterprises face additional compliance challenges because all calendar data is processed on US-based servers.1 While the platform provides a Data Processing Addendum (DPA) containing Standard Contractual Clauses (SCCs), strict data residency laws often require organizations to use hosting solutions that keep data within European borders.1  
Finally, user reviews highlight issues with mobile app usability, such as clunky text copying, a non-responsive mobile interface, and confusing billing experiences where account downgrades fail to stop active subscription charges.13

## **Next-Generation Lifecycle Management and Scheduling Engine: Product Requirement Document (PRD)**

### **Product Overview and Value Proposition**

This Product Requirement Document defines a next-generation enterprise lifecycle management and scheduling platform.11 The software is designed to resolve the industry-wide "post-booking cliff" by combining automated scheduling with a post-meeting workspace.11 This unified platform supports secure client communication, task boards, automated time tracking, and professional billing, removing the need for fragmented third-party integrations.11  
By leveraging **JavaScript** and the sub-second synchronization powers of **Firebase Realtime Database (RTDB)**, the system enforces instant global availability updates, handles high-throughput booking attempts, and allows offline queue synchronization for busy mobile teams.

\+---------------------------------------------------------------------------------+  
|                       NEXT-GENERATION LIFECYCLE PLATFORM                        |  
\+---------------------+---------------------+--------------------+----------------+  
| 1\. Intelligent Lead | 2\. Dynamic Calendar | 3\. Post-Meeting    | 4\. Compliant   |  
|    Qualification    |    Coordination     |    Task Delivery   |    Billing     |  
\+---------------------+---------------------+--------------------+----------------+  
|                   ENGINEERING LAYER: JAVASCRIPT & FIREBASE RTDB                 |  
\+---------------------------------------------------------------------------------+

### **Functional Requirements and User Workflows**

#### **Epic 1: Unified High-Capacity Calendar Synchronization Core**

* **Requirements**: The platform must support real-time, bi-directional calendar synchronization with Google Calendar and Microsoft Graph (Office 365).18 It must allow users to connect up to ten distinct calendars, checking availability across all connections simultaneously in under 500 milliseconds.20 Using Firebase RTDB's persistent connection state and JavaScript's asynchronous SDK, any updates to connected external calendars are evaluated, updated in the user’s centralized availability node, and broadcasted instantly to active client booking interfaces.  
* **User Flow**:  
  1. The host navigates to "Calendar Connections" and selects "Connect Google Calendar".19  
  2. The system redirects the user to the Google OAuth consent screen to authorize permissions securely.1  
  3. Once authorized, a backend sync process fetches busy arrays and writes them directly to the Firebase Realtime Database path /availability/{host\_id}/{date}.  
  4. The host defines booking rules (e.g., "max 3 sessions per day").  
  5. The system runs a background sync, dynamically recalculating the available slots in Firebase RTDB, which immediately refreshes any open booking page via RTDB's active onValue subscription.

#### **Epic 2: Intelligent Routing Forms and Round-Robin Lead Assignment Engine**

* **Requirements**: The platform must support multi-host scheduling, including priority-based Round-Robin routing and Collective availability checks.9 The routing engine must evaluate answers from custom intake forms to qualify leads and assign them to the correct host.6 If the assignee is busy, the system must fallback to an active team member within the pool.9 Round-robin queues are managed in Firebase RTDB using atomic transactional counters in JavaScript to ensure perfectly distributed load balancing without race conditions.  
* **User Flow**:  
  1. An external prospect visits a marketing landing page and fills out an embedded routing form.6  
  2. The prospect enters form data (e.g., Company Size: \>100, Region: EMEA).  
  3. The client-side JavaScript engine evaluates the routing rules stored in Firebase path /routing\_forms/{form\_id}.  
  4. The prospect is routed to a specialized round-robin scheduling page /availability/{emea\_sales\_pool}.  
  5. The slot assignment algorithm runs an atomic transaction to determine which eligible agent has the lowest assignment counter, instantly reserving the slot for that agent.

#### **Epic 3: Client Workspace, Time-Tracking, and Dynamic Billing Orchestration**

* **Requirements**: To solve the post-booking gap, the platform must automatically spin up a secure, client-visible portal and task delivery board inside /workspaces/{workspace\_id} when a meeting is booked.11 This portal must support file uploads, shared checklists, and communication history.11 It must also feature native time-tracking that logs prep, meeting, and follow-up durations.11 These tracked hours must feed directly into invoice generation.11  
* **User Flow**:  
  1. A consultant books a "Strategy Kickoff" session with a new client.  
  2. An atomic write in Firebase RTDB simultaneously marks the slot as booked and creates a new document entry in /workspaces/{workspace\_id} with client read-only access permissions.  
  3. The client receives an automated, white-labeled invitation link. Upon logging in, client-side JavaScript mounts the real-time checklist and workspace files.11  
  4. During the kickoff meeting, the consultant activates the native timer inside the app. JavaScript updates /workspaces/{workspace\_id}/timers/current in real time to capture active prep and meeting hours.11  
  5. When the timer stops, a Cloud Function aggregates the billing amount and builds an dynamic invoice under /workspaces/{workspace\_id}/billing/invoices.

#### **Epic 4: HIPAA and GDPR Sovereign Compliance Architecture (Automated BAA)**

* **Requirements**: The system must support HIPAA compliance by providing an automated, legally binding BAA directly inside the billing interface.14 The database must encrypt all Protected Health Information (PHI) both in transit (using TLS 1.3) and at rest (using AES-256).1 Additionally, patient intake form answers, diagnostic tags, and clinician specialties must be masked in standard calendar notifications to ensure patient privacy.1 In Firebase, this is enforced by writing PHI payload configurations to a specialized, secure node /secure\_phi/{booking\_id} governed by strict security rules that prohibit third-party integrations from accessing clinical fields.  
* **User Flow**:  
  1. A healthcare provider upgrades to the Healthcare subscription tier.  
  2. The system displays a prompt to sign a digitally pre-executed BAA.14  
  3. Once signed, the platform activates HIPAA-compliant data handling controls.15  
  4. A patient books a therapy session and fills out a custom clinical intake questionnaire.15  
  5. The client-side JavaScript splits the non-PHI calendar meta (date/time) from the clinical intake responses, sending the clinical questions strictly to /secure\_phi/{booking\_id}.1  
  6. The calendar notification sent to the provider uses a generic placeholder (e.g., "Clinical Consultation \- Client ID \#184") to protect the patient's identity.15

#### **Epic 5: Headless Scheduling API and Real-Time Webhook Engine**

* **Requirements**: The platform must offer a headless Scheduling API that lets developers embed booking mechanisms into external apps without redirects or iframe overlays.2 The API must support JSON-formatted requests, authorize via OAuth 2.1 tokens, and trigger real-time webhooks for key lifecycle events: invitee.created, invitee.canceled, and routing.submitted.21 In our architecture, Firebase Realtime Database triggers (onValueWritten) act as the immediate dispatchers, triggering outbound webhook payloads to subscriber systems instantly upon node updates.  
* **User Flow**:  
  1. An AI assistant determines that a customer needs a technical consultation and issues a programmatic request.2  
  2. The assistant executes a HTTP POST request containing details to the API /bookings endpoint.3  
  3. The server-side JavaScript app receives the API call, processes authorization, and triggers an atomic transaction on the specified slot in Firebase.  
  4. An RTDB database write triggers a Firebase Cloud Function (onValueWritten) at /bookings/{bookingId}.  
  5. The function loads the subscriber's webhook URL and dispatches the payload in real-time.

### **Technical Developer and Security Integration Specifications**

For internal systems, developers authenticate requests using Personal Access Tokens (PATs); public applications must use OAuth 2.1 authentication protocols.21

                     \+---------------------------------------+  
                     |       Developer API Interface         |  
                     \+-------------------+-------------------+  
                                         |  
                       \+-----------------+-----------------+  
                       |                                   |  
                       v \[Internal Apps\]                   v \[Public Integrations\]  
            \+----------+----------+             \+----------+----------+  
            | Personal Access Token |             |      OAuth 2.1      |  
            |        (PAT)        |             |    Authorization    |  
            \+---------------------+             \+---------------------+

#### **Real-Time Database JSON Schema Design**

The following layout represents the optimal Firebase Realtime Database flat tree pattern to handle relations and scale horizontally without deep nesting:

JSON  
{  
  "users": {  
    "host\_uid\_001": {  
      "name": "Dr. Sarah Jenkins",  
      "email": "sarah.jenkins@healthclinic.org",  
      "tier": "healthcare\_pro",  
      "timezone": "America/New\_York"  
    },  
    "client\_uid\_999": {  
      "name": "John Doe",  
      "email": "johndoe@patientmail.com",  
      "timezone": "America/New\_York"  
    }  
  },  
  "event\_types": {  
    "host\_uid\_001": {  
      "event\_type\_abc": {  
        "title": "Clinical Therapy Consultation",  
        "duration": 45,  
        "price": 150,  
        "currency": "USD",  
        "requiresPhi": true  
      }  
    }  
  },  
  "availability": {  
    "host\_uid\_001": {  
      "2026-06-15": {  
        "slot\_1000": {  
          "startTime": "2026-06-15T10:00:00-04:00",  
          "endTime": "2026-06-15T10:45:00-04:00",  
          "status": "free",  
          "bookingId": null  
        },  
        "slot\_1100": {  
          "startTime": "2026-06-15T11:00:00-04:00",  
          "endTime": "2026-06-15T11:45:00-04:00",  
          "status": "free",  
          "bookingId": null  
        }  
      }  
    }  
  },  
  "bookings": {  
    "booking\_id\_888": {  
      "hostId": "host\_uid\_001",  
      "inviteeId": "client\_uid\_999",  
      "eventTypeId": "event\_type\_abc",  
      "timeSlotId": "slot\_1000",  
      "date": "2026-06-15",  
      "status": "confirmed",  
      "workspaceId": "ws\_id\_555"  
    }  
  },  
  "secure\_phi": {  
    "booking\_id\_888": {  
      "symptoms": "Encrypted symptoms data: AES256\[Chronic neck pain and insomnia\]",  
      "medications": "Encrypted medications data: AES256\[None\]",  
      "signedBaa": true  
    }  
  },  
  "workspaces": {  
    "ws\_id\_555": {  
      "bookingId": "booking\_id\_888",  
      "tasks": {  
        "task\_id\_01": {  
          "title": "Complete post-session notes",  
          "completed": false,  
          "assignedTo": "host\_uid\_001"  
        }  
      },  
      "billing": {  
        "amountDue": 150,  
        "status": "pending\_invoice",  
        "currency": "USD"  
      }  
    }  
  },  
  "webhook\_subscriptions": {  
    "host\_uid\_001": {  
      "sub\_id\_333": {  
        "url": "https://api.crm-connector.com/v1/webhook",  
        "events": {  
          "invitee.created": true,  
          "invitee.canceled": true  
        }  
      }  
    }  
  }  
}

#### **Preventing Double-Booking: Real-Time Atomic Transaction**

To guarantee that two users cannot schedule the exact same slot simultaneously, client connections run an atomic transaction check on the specific availability node:

JavaScript  
import { getDatabase, ref, runTransaction, set } from "firebase/database";

/\*\*  
 \* Executes a thread-safe booking transaction to prevent double bookings.  
 \* Relies on Firebase RTDB's compare-and-set logic.  
 \*   
 \* @param {string} hostId \- UID of the service provider.  
 \* @param {string} dateStr \- Date key format (YYYY-MM-DD).  
 \* @param {string} slotId \- Time slot key (e.g., slot\_1000).  
 \* @param {string} inviteeId \- UID of the client booking the slot.  
 \* @param {Object} bookingMetadata \- Booking metadata.  
 \*/  
export async function secureTimeSlotBooking(db, hostId, dateStr, slotId, inviteeId, bookingMetadata) {  
  const slotRef \= ref(db, \`availability/${hostId}/${dateStr}/${slotId}\`);  
    
  try {  
    const transactionResult \= await runTransaction(slotRef, (currentValue) \=\> {  
      // If node is null, it means the slot was not initialized or removed  
      if (currentValue \=== null) {  
        return currentValue;  
      }  
        
      // If slot is not marked 'free', abort transaction to prevent overwrite  
      if (currentValue.status\!== "free") {  
        return; // Undefined return tells SDK to abort transaction  
      }  
        
      // Update values in database atomically  
      currentValue.status \= "booked";  
      currentValue.bookingId \= bookingMetadata.id;  
        
      return currentValue;  
    });

    if (\!transactionResult.committed) {  
      throw new Error("Double-booking prevented: The requested slot is already taken.");  
    }

    // After reserving availability slot, atomically write booking record  
    const bookingRef \= ref(db, \`bookings/${bookingMetadata.id}\`);  
    await set(bookingRef, {  
      hostId,  
      inviteeId,  
      timeSlotId: slotId,  
      date: dateStr,  
      status: "confirmed",  
      workspaceId: bookingMetadata.workspaceId,  
      timestamp: Date.now()  
    });

    return { success: true, bookingId: bookingMetadata.id };  
  } catch (err) {  
    console.error("Booking error occurred:", err.message);  
    throw err;  
  }  
}

#### **Firebase Server-Side Security Rules (database.rules.json)**

Client code running on browsers or devices cannot bypass security parameters. These database rules enforce data isolation, role restrictions, and check double-booking rules directly at the server level:

JSON  
{  
  "rules": {  
    "users": {  
      "$uid": {  
        ".read": "auth\!= null",  
        ".write": "auth\!= null && auth.uid \=== $uid"  
      }  
    },  
    "availability": {  
      "$hostId": {  
        ".read": "true",  
        "$date": {  
          "$slotId": {  
            // Write allowed if:  
            // 1\) The slot is currently free and client is booking it (setting status to booked)  
            // 2\) Or, the authenticated user is the host themselves (managing calendar availability)  
            ".write": "auth\!= null && (data.child('status').val() \=== 'free' || $hostId \=== auth.uid)"  
          }  
        }  
      }  
    },  
    "bookings": {  
      "$bookingId": {  
        ".read": "auth\!= null && (data.child('hostId').val() \=== auth.uid || data.child('inviteeId').val() \=== auth.uid)",  
        ".write": "auth\!= null"  
      }  
    },  
    "secure\_phi": {  
      "$bookingId": {  
        // Strict HIPAA restriction: Only authenticated hosts or patient owner can query PHI  
        ".read": "auth\!= null && (root.child('bookings').child($bookingId).child('hostId').val() \=== auth.uid || root.child('bookings').child($bookingId).child('inviteeId').val() \=== auth.uid)",  
        ".write": "auth\!= null && (root.child('bookings').child($bookingId).child('inviteeId').val() \=== auth.uid)"  
      }  
    }  
  }  
}

#### **Cloud Function: Event Dispatcher for Webhook Orchestration**

Using Firebase Realtime Database triggers (onValueWritten), changes are intercepted on the server side to instantly dispatch outgoing webhook notifications:

JavaScript  
import { onValueWritten } from "firebase-functions/v2/database";  
import fetch from "node-fetch";

/\*\*  
 \* Listens for writes at \`/bookings/{bookingId}\` to trigger webhooks.  
 \* Bypasses direct user interaction to avoid slow performance.  
 \*/  
export const dispatchBookingWebhook \= onValueWritten("/bookings/{bookingId}", async (event) \=\> {  
  const bookingId \= event.params.bookingId;  
  const change \= event.data;  
    
  // Exit early if the booking was deleted  
  if (\!change.after.exists()) {  
    console.log(\`Booking ${bookingId} was deleted. Skipping webhook dispatch.\`);  
    return;  
  }  
    
  const bookingData \= change.after.val();  
  const hostId \= bookingData.hostId;  
    
  // Read subscribers from Firebase RTDB  
  const db \= event.data.ref.database;  
  const subscriptionRef \= db.ref(\`webhook\_subscriptions/${hostId}\`);  
  const subscriptionSnapshot \= await subscriptionRef.once("value");  
    
  if (\!subscriptionSnapshot.exists()) {  
    return; // No active webhook subscriptions found for this host  
  }  
    
  const subscriptions \= subscriptionSnapshot.val();  
  const payload \= {  
    event: change.before.exists()? "invitee.updated" : "invitee.created",  
    timestamp: Date.now(),  
    bookingId: bookingId,  
    data: bookingData  
  };

  // Dispatch payloads to active webhooks concurrently  
  const promises \= Object.values(subscriptions).map(async (sub) \=\> {  
    if (sub.events && sub.events\[payload.event\]) {  
      try {  
        const res \= await fetch(sub.url, {  
          method: "POST",  
          headers: { "Content-Type": "application/json" },  
          body: JSON.stringify(payload),  
          timeout: 5000  
        });  
        console.log(\`Webhook dispatched to ${sub.url}, Response Status: ${res.status}\`);  
      } catch (err) {  
        console.error(\`Failed webhook dispatch to ${sub.url}:\`, err.message);  
      }  
    }  
  });

  await Promise.all(promises);  
});

### **Feature-Specific Functional Requirements Matrix**

| Epic ID | Specific Feature Requirement | Target Tier | Implementation Priority | Core Metric / Success Indicator |
| :---- | :---- | :---- | :---- | :---- |
| **Epic 1** | Bi-directional Multi-Calendar Sync (checks up to 10 connected accounts).20 | Standard / Teams 9 | High | Zero double-booking errors across connected calendars.20 |
| **Epic 2** | Advanced Routing Forms with dynamic qualification and priority assignments.6 | Teams 9 | Medium | Minimum 35% conversion rate on lead-to-booking flows.11 |
| **Epic 3** | Unified Client Portal featuring file sharing, shared task lists, and direct communication history.11 | Professional / Enterprise | High | Client portal engagement rate (\>65% active client logins).11 |
| **Epic 3** | Automated Invoicing matched to logged meeting prep, duration, and follow-up hours.11 | Professional / Enterprise | Medium | Drop in billing admin hours for active consultants.11 |
| **Epic 4** | HIPAA-Compliant database engine with automated BAA signatures.14 | Professional (Healthcare) | Critical | Zero data leaks containing PHI; full compliance audits passed.15 |
| **Epic 4** | Notification Masking that replaces patient identities and diagnostic tags in calendar alerts.15 | Professional (Healthcare) | Critical | Complete compliance with HIPAA privacy and notification rules.15 |
| **Epic 5** | Headless Scheduling API with support for OAuth 2.1 authentications.21 | Developer / Enterprise | High | API response time under 150ms for programmatic bookings.3 |
| **Epic 5** | Webhook notifications for booking updates, cancellations, and routing forms.2 | Standard / Teams 2 | High | Guaranteed delivery rates (\>99.9%) on webhook notifications.2 |

### **Key Performance Indicators and Success Metrics**

To evaluate platform performance and user adoption, the system dashboard tracks several core metrics:

* **No-Show Rate (![][image4])**: Tracks the percentage of scheduled appointments where the invitee fails to attend. It is calculated as:  
  ![][image5]  
  The target is a no-show rate under 3% using upfront payments and SMS workflow reminders.1  
* **Lead-to-Booking Velocity (![][image6])**: Measures the average time elapsed from initial routing form submission to booking confirmation.6 The target is under 45 seconds for qualified leads.  
* **System-Wide Integration Density (![][image7])**: Measures the average number of active external app integrations per paying tenant.5 The target is at least 4.2 active connections per account on Teams and Enterprise tiers to drive product stickiness.  
* **Billing and Administrative Efficiency (![][image8])**: Tracks the average weekly hours business owners spend on post-meeting tasks (billing, timesheet tracking, follow-up messages).11 The target is a 50% reduction in admin hours using the integrated client portal.11

## **Strategic Product Recommendations**

The scheduling market is shifting from simple calendar coordination to deeper workflow automation.11 This shift highlights several clear paths for platform development:

1. **Solve the Post-Booking Cliff**: Traditional scheduling tools only focus on booking meetings, leaving users to manage the actual work in separate, fragmented apps.11 Building native client portals, task boards, and time-tracking directly into the booking engine bridges this gap, creating a single platform for the entire client lifecycle.11  
2. **Build Out Specialized Compliance Portals**: Many organizations need to schedule client-facing meetings but cannot use generic schedulers due to strict regulatory rules.15 Creating dedicated, HIPAA-compliant scheduling flows backed by native BAA signatures lets the platform serve high-value regulated sectors like healthcare, mental health, and medical training.15  
3. **Optimize for High-Value, Multi-Session Services**: Selling single meetings often leads to higher churn and unstable revenue for service providers.11 Expanding the payment engine to natively support multi-session packages, deposit collections, retainer-based billing, and custom checkout terms helps businesses secure upfront commitments and grow customer lifetime value.11  
4. **Adopt a Headless, Developer-First Infrastructure**: The rise of AI assistants and custom internal tools means scheduling must happen programmatically behind the scenes.2 Providing robust REST APIs, secure OAuth frameworks, and reliable webhook notifications allows developers to build booking engines directly into custom portals and AI-driven workflows.21

By shifting its focus from simple calendar coordination to end-to-end client management, the next-generation platform can move past standard point solutions and establish itself as the core operating system for service-based businesses.11

#### **Works cited**

1. Is Calendly Safe? Security, Privacy, and What You Need to Know in ..., accessed June 15, 2026, [https://zeeg.me/en/blog/post/is-calendly-safe](https://zeeg.me/en/blog/post/is-calendly-safe)  
2. Webhooks \- Calendly Developer, accessed June 15, 2026, [https://developer.calendly.com/api-docs/adf83e8f05e54-webhook-examples](https://developer.calendly.com/api-docs/adf83e8f05e54-webhook-examples)  
3. Build powerful custom apps with Calendly APIs, accessed June 15, 2026, [https://calendly.com/blog/api-dev-portal](https://calendly.com/blog/api-dev-portal)  
4. Get paid for your services | Calendly, accessed June 15, 2026, [https://calendly.com/payments](https://calendly.com/payments)  
5. Integrations \- Calendly, accessed June 15, 2026, [https://calendly.com/integration](https://calendly.com/integration)  
6. Calendly Alternatives for B2B Sales Teams \- LeanData, accessed June 15, 2026, [https://www.leandata.com/blog/calendly-alternatives/](https://www.leandata.com/blog/calendly-alternatives/)  
7. Calendly Pricing 2026: Plans, Features & Hidden Costs | Cal.com, accessed June 15, 2026, [https://cal.com/es/blog/calendly-pricing](https://cal.com/es/blog/calendly-pricing)  
8. Cal.com or Calendly? Pricing, features & the best picks for 2026 \- Koalendar, accessed June 15, 2026, [https://koalendar.com/blog/calcom-vs-calendly](https://koalendar.com/blog/calcom-vs-calendly)  
9. Calendly Review 2025 \- Features, Pricing & Alternatives | Workflow ..., accessed June 15, 2026, [https://workflowautomation.net/reviews/calendly](https://workflowautomation.net/reviews/calendly)  
10. Calendly Pricing: 2026 Guide & Calculator \- Zeeg, accessed June 15, 2026, [https://zeeg.me/en/blog/post/calendly-pricing](https://zeeg.me/en/blog/post/calendly-pricing)  
11. Calendly vs Acuity: Which Scheduling Tool Is Best? (2026) \- Plutio, accessed June 15, 2026, [https://www.plutio.com/compare/calendly-vs-acuity](https://www.plutio.com/compare/calendly-vs-acuity)  
12. Budget Best Scheduling Software for Health Coaches with HIPAA \- Lunacal, accessed June 15, 2026, [https://lunacal.ai/blogs/scheduling-software-health-coaches-hipaa](https://lunacal.ai/blogs/scheduling-software-health-coaches-hipaa)  
13. Superhuman Alternatives 2026: Top 5 Competitors Compared \- CheckThat.ai, accessed June 15, 2026, [https://checkthat.ai/brands/superhuman/alternatives](https://checkthat.ai/brands/superhuman/alternatives)  
14. Is Calendly HIPAA compliant? \- TeachMeHIPAA, accessed June 15, 2026, [https://teachmehipaa.com/hipaa-baa/scheduling/calendly/](https://teachmehipaa.com/hipaa-baa/scheduling/calendly/)  
15. Is Calendly HIPAA Compliant? Real-World Scenarios to Help You Understand, accessed June 15, 2026, [https://www.accountablehq.com/post/is-calendly-hipaa-compliant-real-world-scenarios-to-help-you-understand](https://www.accountablehq.com/post/is-calendly-hipaa-compliant-real-world-scenarios-to-help-you-understand)  
16. Is Calendly HIPAA Compliant? If not what is? \- Qwil Messenger, accessed June 15, 2026, [https://www.qwilmessenger.com/blog/is-calendly-hipaa-compliant](https://www.qwilmessenger.com/blog/is-calendly-hipaa-compliant)  
17. SimplyBook.me vs. Calendly: A Comprehensive Comparison (2026 Update), accessed June 15, 2026, [https://news.simplybook.me/simplybookme-calendly-comparison-2026/](https://news.simplybook.me/simplybookme-calendly-comparison-2026/)  
18. What Is Calendly? Features, Pricing & Alternatives \- Koalendar, accessed June 15, 2026, [https://koalendar.com/blog/what-is-calendly](https://koalendar.com/blog/what-is-calendly)  
19. Webhooks overview | Calendly Help, accessed June 15, 2026, [https://calendly.com/help/webhooks-overview](https://calendly.com/help/webhooks-overview)  
20. Calendar Connections \- Calendly, accessed June 15, 2026, [https://calendly.com/scheduling/calendar-connections](https://calendly.com/scheduling/calendar-connections)  
21. Getting Started with Calendly API, accessed June 15, 2026, [https://developer.calendly.com/getting-started](https://developer.calendly.com/getting-started)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAaCAYAAAAaAmTUAAACxklEQVR4Xu2XSchNcRjGX1NmSpFIFiSFzBYSJSKZsqDMpJQxRZEMsbGQDbKRElZmSYYFNpQhogyR7ysZsjEsWEg8z33/xzn3Oeeee3Xv/Tbur56+c5/3/M/5j+97PrMG/wftoDNQPw1UwQToiJotwWForpo1YC+0Xc16shA6p2aNaAu9gMZroBL6Qzuhm9Ab6C70FFoZ4vuhSeGatIbeQdMTXpIu0HXoEfQb+g71LLrDZ/+refwbdLk4bFugi+KVZYf5y+5A06D2wW8D7YHuh3iH4JPZ0GuoVcLLglul2bzDm4tDBcaYD7irBsAA83ZDNVCKY+YN1msgwOV+C10R/wR0ULwsuNIToV/Qe4snKmIBtFu8JE2WH//LBvOBcHvlcRXaJN5LaJ14SmfoYbg+Zf6uVXG4wCHzwZbiOHRBTaWX+X59ZZ5e89gHDUr87m7esTkJL4tZ0IFwPcq8zeM4XIDnkqtfCm7TJ2oqfAkfrjNeCcPN2+bNKOE7ZiR+XzNvNyX8Hgydj8OZcPU/qKk8N3/wSA1UwFjztsM0IPBgM6tFMPOxXbRt2FFu9TyWQD/Ns2cmPIR86A/zjJXHfEtX92hl+LcUfaEbaoIH5m1Hm9eoIcXhFIvM7y85GNJsflNH8ZN0Mu+QPoiDK7fNlkFb1bS4cxzIM4llsQb6oqbC+sGHztNAoAd0CZqsAfMsxbYzNZCAqXucmuaHnfWJ7VkWyrHN0kkjBfcyDySruM4wP/SYjkeIn6QJ2qhmgCv3ydIVPyIqCYs1kMFR87ReFs7ScugWdM+8EWvOUiuu9llwVk+Kxyp+2/wssrOfLXvAXFkOtrcGMmBa5mdNXVlh3qFyNaoauplnskoGXRV80UfzbFcvVkNn1awXay39pVsreAS4xQZqoF4wZTPFTtVADdhl8b8fLQbr1GmojwaqgNm0krTdoEGDf+QPDZ6F0W+H9UAAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAABBklEQVR4XmNgGAWDClgB8W4gvg/E/4H4BKo0GOwA4t8MEPlnQNyIKo0JdgLxAwaIBjNUKTAoAuL56ILYADcQXwfiBAaIYetRZCFgChA7oQtiA25APAmI2RgQrlNHVgAEpxgg8gRBNxAHQNnFDBDDQIbDgDwQb0Xi4wVngJgPyuYB4jdA/AmIBaBiaQyQMCMIxIH4EJpYGwPEdSBXgsBKIDZASOMGUUBcgyYmAcTfgPgpEPMC8Q1UadxgDgMkraGDGQwQ1y2GYqLANSBmQRcEAg0GiGEgnIgmhxV4AfF5IGZEl4CC1QwQw6TRJZCBDQMkBmE2PwBiO2QFUGAJxJfQBUfBKBjSAAAANDDneVsDZAAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAaCAYAAADbhS54AAAB8ElEQVR4Xu2WPUgcQRTHn0kMiFiEINhEEA1IEiKK2mijhWgkaSyEkDQmaCUi2AiiB2LhN4haWKkJolhYRBAN6eJnnRCw1UIbFQRFRfT/9+3m3g53YHFZUuwPftzOe3M3s7NvZk8kIiLijmL4HR7BG/jHa/+GZ167B6b7XwibOdGJ5ZpYBox58TETD5U9+NMNgnzRie27iTAoEh28002AVtHcgpsIgw7RwV+bWBZ8Dw9Ea+6JyYXGKjwRradeuCw6UU6oLt4tXDLhBfzixAfgBsx24oQr+0N08hMm/hGewyvYbuKf4DwchkNwFj4w+YS8ER2gxYnXenE+5kSUwWl4LHpzPv2w0LQ/wxHTfiv3rFfeBSfw0on7ddftxH24Ik9FdzNXxGfKXJNdWGLaBbDZtJOyAw9hmhNfk8Qr6RMzn+ve9SMJrg75JXoMvYOPnVxSnokOvuQmRAufOT4K8lXi9cb64CYh/I1r+ApWwkYv7lMBN0V/6xTWB9NBeG5twUuJH56cSJXp8xyuiN7xN1htcnyNNZj2ouiboQvmmLglT3QDbLuJVNImwd1aI7oaXFWfh3DQtAn78Wj6Z3DnWViffNlPmlip6FPhBAn7zMAXf3ukEB4DXBX+6+hzctyltr6a4Ac4LrrzR2G5yUdERPz33ALo52GUhNteuAAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,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>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAaCAYAAADBuc72AAACDUlEQVR4Xu2WTUgVYRSGXyksNUtDF4KFLVoE/ZBuSgovaq0SWgRhC6l1CS7cRD8oIu6EFkGgiyjEleIiUgoXBqHmIij8oaSd7lVMUqTe0/luc+7BroKXq4t54OHOvGfm3m++OTPfBWJiYjLKLfqbbtI5+p6uhGyDTtCxUJfsqp6Wfd7QJ/SYyd5BB3XaZOfpT1pisqxxlA677DB0QN9dLnz1Qba4R++47Bp0Np+7PA/aFnuC3NpDLuuEDlR615JLz7hsT/kIHWiRL+wnCqFP+idfMNTQt9CL6aONqWU8hbbIJL3uamX0GfTcXtpGh+gsvRIdtj0N0C/p8gXHY2zdr030Udi+TH/Rs1H5L1V0HdrzSVrovNnfluTV1vuCQ2ZUZs7zkI6b/W/Qi7I8oB9cJsfMuCwtn+ka9BX1Pw5CF4Q6X3DIQ7pK77q8H6l3rBK6oMh7ekdUQGdzq1tquQRdpQp8wXGfTtN8ly/S19BFRgb8BfrbaSmFDkxcgA5U/BGyE9Gh/5DbKw+K5SQ9ZfbP0VFabjLhAvT7j5vsBvQO+WN3jfSn9LKlA9HDcYS+gr5BhET4FJqhM2i5CB18tct3xQG6TG+aTBaBF2E7J2zLLCXobaT2qPRnt9kXXtIp6IKSEWqhf2Dk6mVG5QelPeQVlHyXtoa6Vf5tSWv00CU6SNvpAB0JebGcHBMTE6P8AeNWacE7wW3aAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAAaCAYAAAAnkAWyAAACNklEQVR4Xu2WzUtUYRTGH/sgrTRLzIQKwo3QoqgWSVoYBFGtisC/IISiTQhSUJAQlBSVEQgiRFCrCCQw1Ej7gAQXiUELN0FREVFZkGhEPg/nvczLaWZ2zUxwf/Bj5j3nzr1nzvsxA6SkpPy3bKPD9Av9Q1+HsRyl3+kYbQ3XlyR3YMVvcPGV9AGdoy0uVzK8pZM+GFgLm4GnPlEKbIF1/ZJPRDyGXVPhE8WmA1bYfp+IeAa7psEnis0QnYet72wsgS0bFV/lckVFBWszPvKJiD2wwidc/ASdph/pTVoX4ovoQ/qVvgoxsZl+gN1rEJnn6mSbhe05vddnRsJn8nIQdrPTPhHRA7um3SdgRVz0QbKY9sIKbI7iB+gxeobuCrFK+ovuCGPNbl94n5drsMKafCKwkc7Aur7C5ZbRn/SQiwsVosbcpbeieBddF14T9tFPsC8squmpTDo3mvZvsHXtUUeew6ZRx6VnN/2Nv7+U0MNX0b2w7q8J8RvhVU1JOE/vR+NyWhuNs7IJ1vUBFy+DPVS/treReyPrlHrigwEVlDBFj9Ol9EoUTxilnT6YC621F7ATRsW/R+YvgVTR/bD1mQ91q9sHYRv2QjQ+SV/CfqHborhYDpuZnS7+T1GB+j901CfIVnokGq+mP2Adro/iQjOsnO5XMLQhNWvafB51er2L6eSJj82Ec7DZLhha6+OwZXed1oS4NtpV+pneg50aCduR2aziMD1L39E39DJtjPIpKSkpRWQBk7NwOsd5CjUAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADkAAAAaCAYAAAANIPQdAAACe0lEQVR4Xu2WS4hOYRjH/265pnHJQggbBgu5ZIGxkHIJhRViLEgKNauRKIloGplkIRsSRqRciprMuCzkOguhSckGodwKoYn/3/N+8709c5hvY6ZT769+zZnnf+Y75znfed53gEQikehiZtIG+on+ol/pTTqfdqNX6ZOQtdK7dP+fv8wh52GNjPEBWQnLqn2QJ/SNvaUPfRA4AWtyug/yxAxYE/t8QHrSj/Q17e6yXLED1uRcH5A5sOy0D/KGFho18i83tZ2dQ8pgTTT6IHAdlpe7ehanaIUvknrY6v0YtpLrWu9oVXxS4Dgse+YDMhhWf07PwNaSklgBa2KXD0h/2Lbx0gcZ6GHpBpb7gPSgn+m8qDYQth0ti2pCc19Y6LQexKylD+gGV++Qw/j7PC6FZUd94FATw+ktZN/AFPqDDnD1bfSiq02mlfQbHRXVp9FFsPuZGNVLQhv9d9rXB+QQ7ENX+cChfyjEBbo9DgJbYHPv2U3vuZrOHU2f0tlRXXv1YvoqqpXEeFgTTT4INMPyQT6IGEHHheNj9GAxauMs3eOLsIeieY05EH5eQfHhLqAj6V56MtQ6RPviHfoT1oRmTguCXlnNhC7+IWRSWdZNiq2wLUjegC0+MXqV39OFrt4Hdg2NRAFdu9DkEdjrrPPWh9o1ZI/Df2UJHRb9rpvSA4mZiux53Az7tuIVUnNXaEifpUbX0N60F/1CJ4S8UxiC9ivyRvrI1TRjWpBiVtNLdKir69xJ4Viv6n0U53IWfROOOwU97RbYzGpWhObmMmwRq6P9aA19Ec7bCZs/fXvr0H6POwdr4jYdC1vMtBeKWtjD0+uth5NIJBKJLuE34gWLd4mGp24AAAAASUVORK5CYII=>