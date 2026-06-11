import type TimeDataType from "@/types/TimeDataType";

type LastEventType =
    | {
          type: "editroom";
          prev: string | undefined;
          value: string;
      }
    | {
          type: "edittime";
          prev: TimeDataType;
          value: TimeDataType;
      };
export default LastEventType;
