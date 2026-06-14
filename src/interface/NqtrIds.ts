// Re-exported from "@drincs/nqtr/registries" so that the main @drincs/nqtr package
// exposes the same types that live in the registries namespace. Module augmentation
// via `declare module "@drincs/nqtr/registries"` therefore narrows *IdType everywhere.
export type {
    NqtrActivityIds,
    NqtrCommitmentIds,
    NqtrLocationIds,
    NqtrMapIds,
    NqtrQuestIds,
    NqtrRoomIds,
    ActivityIdType,
    CommitmentIdType,
    LocationIdType,
    MapIdType,
    QuestIdType,
    RoomIdType,
} from "@drincs/nqtr/registries";
