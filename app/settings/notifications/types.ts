export type NotificationPrefs = {
  bell_likes:     boolean
  bell_comments:  boolean
  bell_follows:   boolean
  bell_messages:  boolean
  bell_orders:    boolean
  bell_system:    boolean
  email_comments: boolean
  email_follows:  boolean
  email_orders:   boolean
  email_system:   boolean
}

export const DEFAULT_PREFS: NotificationPrefs = {
  bell_likes:     true,
  bell_comments:  true,
  bell_follows:   true,
  bell_messages:  true,
  bell_orders:    true,
  bell_system:    true,
  email_comments: true,
  email_follows:  false,
  email_orders:   true,
  email_system:   true,
}
