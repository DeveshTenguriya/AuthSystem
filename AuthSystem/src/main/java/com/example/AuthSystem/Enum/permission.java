package com.example.AuthSystem.Enum;

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
