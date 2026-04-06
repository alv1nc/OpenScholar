# OpenScholar — Administrator Guide

This document covers everything an Administrator needs to know to manage the OpenScholar platform: how to claim the initial admin seat, how to use the Admin Panel, and the safety rules built into the system.

---

## 1. How the Admin Role Works

OpenScholar has three user roles:

| Role | Description |
|---|---|
| `student` | Default role. Can upload papers, comment, message, and cite. |
| `faculty` | Same as student. Role label indicates academic position. |
| `admin` | Full access to the Admin Panel. Can delete users, papers, comments, and promote roles. |

> [!IMPORTANT]
> Roles are enforced on the **backend**. Even if a non-admin navigates to `/admin`, the API will reject all requests with `403 Forbidden`.

---

## 2. Bootstrapping the First Admin

The very first admin is claimed via a special **one-time setup wizard** in the browser — no terminal commands or developer tools needed.

### Steps:

1. **Register a normal account** at `http://localhost:3000/register`. Any role works.
2. Navigate to `http://localhost:3000/setup`.
3. You'll see the **OpenScholar Setup wizard**. Enter your email and password.
4. Click **"Claim Administrator Seat"**.
5. You'll see a success screen. You are now admin!
6. Log back in — the **Admin Panel** entry will appear in your profile dropdown.

> [!CAUTION]
> The `/setup` page **permanently locks itself** after the first admin is created. If even one admin exists, the page shows a "Setup Already Complete" screen and all API calls are rejected. Subsequent admins must be promoted via the Admin Panel.

> [!NOTE]
> If you navigate to `/setup` when your database already has an admin, you will just see a locked screen with a link back to login — nothing can be changed.

---

## 3. Accessing the Admin Panel

Once your account has the `admin` role, you will see a new **"Admin Panel"** entry in the navigation dropdown (profile menu, top right of the page).

Alternatively, navigate directly to: `http://localhost:3000/admin`

Non-admin users who land on `/admin` are automatically redirected to `/dashboard`.

---

## 4. Admin Panel Features

The Admin Panel has two tabs:

### 4.1 User Base Tab

Displays a full table of all registered users including their name, email, and role.

**Available actions per user:**

| Action | Condition | Description |
|---|---|---|
| **Make Faculty** | Student accounts only | Upgrades the user's role label to `faculty`. |
| **Grant Admin** | Non-admin accounts | Promotes the user to full `admin` privileges. Use with caution. |
| **Terminate** | Any account that is NOT your own | Permanently deletes the user account via cascade wipeout. |

> [!WARNING]
> **Terminating a user triggers a full CASCADE DELETE:**
> - All their uploaded **papers** are deleted.
> - All their **comments** across the platform are deleted.
> - All their **messages** and **conversations** are deleted.
> - All **citation links** involving their papers are dissolved.
>
> **This action is irreversible. There is no soft delete or undo.**

You cannot delete your own account from the panel — it will show "Protected User" next to your own row.

### 4.2 Global Library Tab

Displays every paper uploaded in the system, including the uploader's name.

**Available actions:**

| Action | Description |
|---|---|
| **Shred Asset** | Permanently deletes the paper document and all associated data. |

> [!WARNING]
> **Shredding a paper triggers a full CASCADE DELETE:**
> - The paper's **PDF file** reference is removed.
> - All **Comments** on the paper are deleted.
> - All **Citation records** pointing to or from this paper are dissolved.
> - The `citationCount` on other papers that cited this one becomes stale (known limitation — see below).
>
> **This action is irreversible.**

---

## 5. Creating Additional Admins

Once you hold the Admin seat, you can promote other users to `admin` directly from the **User Base** tab:

1. Find the target user in the table.
2. Click the **"Grant Admin"** button.
3. Confirm the modal prompt.

The user will need to **log out and log back in** for the UI badge to update.

> [!NOTE]
> There is no limit to the number of admins on the platform. However, admins **cannot demote other admins** — only the database owner can do this directly via SQL.

---

## 6. Known Limitations & Future Work

| Issue | Status |
|---|---|
| `citationCount` not recalculated after paper deletion | Known limitation — counter becomes stale |
| Admins cannot demote other admins via UI | By design — requires direct DB access |
| No audit log of admin actions | Not yet implemented |
| No admin deletion of individual comments | Not yet implemented — only via paper/user wipeout |
| PDF files on disk are not physically deleted | Only the database reference is removed |

---

## 7. Security Model Summary

- All `/api/v1/admin/*` routes are double-gated: `authenticateJWT` + `requireRole(['admin'])`.
- A non-admin user calling these APIs directly receives `403 Forbidden`.
- The frontend also client-side redirects non-admins away from `/admin` for UX, but this is **not** the sole security layer.
- JWT tokens are validated on every protected request server-side.
