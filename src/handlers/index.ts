import NavigatorHandler from "@/handlers/NavigatorHandler";
import QuestHandler from "@/handlers/QuestHandler";
import RoutineHandler from "@/handlers/RoutineHandler";
import TimeManager from "@/handlers/TimeHandler";
import type {
    NavigatorHandlerInterface,
    QuestHandlerInterface,
    RoutineHandlerInterface,
    TimeHandlerInterface,
} from "@/interface";

/**
 * The global time manager instance. It handles the current time and date, the week structure
 * (week length, weekend, day names) and the time slots of the day.
 */
const timeTracker: TimeHandlerInterface = new TimeManager();
/**
 * The global navigator instance. It gives access to the registered maps, locations and rooms,
 * and it keeps track of the room where the player currently is (saved and restored with the game state).
 */
const navigator: NavigatorHandlerInterface = new NavigatorHandler();
/**
 * The global routine manager instance. It handles the commitments of the characters (fixed or added
 * during the game session), the rooms where they take place and the current routine of each character.
 */
const routine: RoutineHandlerInterface = new RoutineHandler();
/**
 * The global quests manager instance. It gives access to the registered quests, filtered by their
 * state (not started, in progress, completed, failed), and it starts the stages that must start automatically.
 */
const questsNotebook: QuestHandlerInterface = new QuestHandler();

export { navigator, questsNotebook, routine, timeTracker };
