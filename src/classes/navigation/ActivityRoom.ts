import { StoredClassModel } from "@drincs/pixi-vn";
import { ActivityInterface } from "../../interface";

/**
 * The activity generated by the room.
 */
export default class ActivityRoom extends StoredClassModel implements ActivityInterface {
    constructor(categoryId: string, id: string, activity: ActivityInterface) {
        super(categoryId, id)
        // copy all properties from activity to this
        for (let key in activity) {
            if (key !== 'id') {
                this[key as keyof Omit<ActivityInterface, "id">] = activity[key as keyof ActivityInterface]
            }
        }
    }
}
