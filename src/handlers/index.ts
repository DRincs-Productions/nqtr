import NavigatorHandler from "@/handlers/NavigatorHandler";
import QuestHandler from "@/handlers/QuestHandler";
import RoutineHandler from "@/handlers/RoutineHandler";
import TimeManager from "@/handlers/TimeHandler";

const timeTracker = new TimeManager();
const navigator = new NavigatorHandler();
const routine = new RoutineHandler();
const questsNotebook = new QuestHandler();

export { navigator, questsNotebook, routine, timeTracker };
