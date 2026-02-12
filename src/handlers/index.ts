import NavigatorHandler from "./NavigatorHandler";
import QuestHandler from "./QuestHandler";
import RoutineHandler from "./RoutineHandler";
import { default as TimeManager } from "./TimeHandler";

const timeTracker = new TimeManager();
const navigator = new NavigatorHandler();
const routine = new RoutineHandler();
const questsNotebook = new QuestHandler();

export { navigator, questsNotebook, routine, timeTracker };
