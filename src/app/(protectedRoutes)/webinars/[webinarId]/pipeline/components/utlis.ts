import { AttendedTypeEnum, CtaTypeEnum } from "@prisma/client"

export const getColumnsForCtaType = (ctaType: CtaTypeEnum): AttendedTypeEnum[] => {
  // Common columns for partnership negotiations
  const commonColumns = [
    AttendedTypeEnum.REGISTERED,
    AttendedTypeEnum.ATTENDED,
    AttendedTypeEnum.FOLLOW_UP,
    AttendedTypeEnum.CONVERTED,
  ]

  // All campaigns are now partnership negotiations (BOOK_A_CALL)
  // Add breakout room for partnership discussions
  return [...commonColumns, AttendedTypeEnum.BREAKOUT_ROOM]
}

export const formatColumnTitle = (columnType: AttendedTypeEnum): string => {
  return columnType
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}
