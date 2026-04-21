package com.example.AuthSystem.Enum;
/**
 * Permission.java — Phase 4
 *
 * Fine-grained permissions assigned to users IN ADDITION to their role.
 *
 * Role vs Permission:
 *   ROLE  = broad category (ADMIN, USER, MANAGER)
 *   PERMISSION = specific action (VIEW_REPORTS, EDIT_USERS)
 *
 * A USER role user could be granted VIEW_REPORTS without being ADMIN.
 * An ADMIN automatically gets all permissions by default (see SecurityConfig).
 *
 * These are stored in the `user_permissions` table and embedded in the JWT.
 */

public enum permission {

    // User management (admin actions)
    VIEW_USERS,
    EDIT_USERS,
    DELETE_USERS,
    LOCK_USERS,

    // Content
    VIEW_REPORTS,
    CREATE_REPORTS,
    EDIT_REPORTS,
    DELETE_REPORTS,

    // Settings
    VIEW_SETTINGS,
    EDIT_SETTINGS,

    // System
    VIEW_AUDIT_LOG,
    MANAGE_ROLES
}
