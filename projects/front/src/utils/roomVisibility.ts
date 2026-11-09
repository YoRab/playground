import type { RoomVisibility } from '@platform/model'
import { type Icon, IconEyeOff, IconLock, IconWorld } from '@tabler/icons-react'

/** The icon of each visibility of a room (settings form, room header, room cards); its texts are `visibility.<value>.*` of the host's dictionary */
export const VISIBILITY_ICONS: Record<RoomVisibility, Icon> = {
  public: IconWorld,
  protected: IconLock,
  private: IconEyeOff
}
