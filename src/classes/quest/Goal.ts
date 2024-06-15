import { StoredClassModel } from "@drincs/pixi-vn"
import { GoalProps } from "../../interface"

const GOAL_CATEGORY = "__nqtr-goal__"

export default class Goal extends StoredClassModel implements GoalProps {
    constructor(id: string, props: GoalProps) {
        super(GOAL_CATEGORY, id)
        this._description = props.description
        this._need = props.need || 1
        this._defaultHave = props.have || 0
    }

    private _description: string
    /**
     * The description of the goal.
     */
    get description(): string {
        return this._description
    }

    private _need: number
    get need(): number {
        return this._need
    }

    private _defaultHave: number
    get defaultHave(): number {
        return this._defaultHave
    }
}

export class GoalStage extends Goal {
    constructor(id: string, stageId: string, props: GoalProps) {
        super(id, props)
        this._stageId = stageId
    }

    private _stageId?: string
    get stageId(): string | undefined {
        return this._stageId
    }
    set stageId(value: string) {
        this._stageId = value
    }

    get have(): number {
        return this.getStorageProperty<number>('have-' + this._stageId) || this.defaultHave
    }
    set have(value: number) {
        if (!this._stageId) {
            console.error(`[NQTR] The stage id is not set for the goal ${this.id}, so the have value can't be set.`)
            return
        }
        this.setStorageProperty('have-' + this._stageId, value)
    }

    get completed(): boolean {
        return this.have >= this.need
    }
    set completed(value: boolean) {
        if (value) {
            this.have = this.need
        } else {
            console.warn(`[NQTR] The goal can't be set as not completed. You must edit the have value manually.`)
        }
    }
    find(): void {
        this.have++
    }
}
