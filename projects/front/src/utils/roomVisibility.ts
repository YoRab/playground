import type { RoomVisibility } from '@platform/model'
import { type Icon, IconEyeOff, IconLock, IconWorld } from '@tabler/icons-react'

/** How each visibility of a room is shown: settings form, room header, room cards */
export const VISIBILITIES: Record<RoomVisibility, { label: string; description: string; icon: Icon }> = {
  public: { label: 'Public', description: 'Anyone can join', icon: IconWorld },
  protected: { label: 'Protected', description: 'Join with a password', icon: IconLock },
  private: { label: 'Private', description: 'Only you can enter', icon: IconEyeOff }
}
