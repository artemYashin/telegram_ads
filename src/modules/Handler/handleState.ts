import { getUserState, State, UserState } from "../UserState/UserState.js"; 
import { cancelState } from "./states/cancelState.js";
import { CommandList } from "./states/commandList.js";
import { handleMainState } from "./states/handleMainState.js";

export async function handleState(chatId: number, command?: CommandList, msgId?: number) {
    return new Promise<void>(async (resolve) => {
        const state = await getUserState(chatId);
        
        if (command === CommandList.CANCEL_STATE) {
            cancelState(chatId);
            resolve();
            return;
        }

        switch (state.state) {
            case State.MAIN_SCREEN:
                await handleMainState(state, chatId, command);
                break;
            case State.WAITING_FOR_MSG:
                // waiting for msg response
                break;
            default:
                await handleMainState(state, chatId, command);
                break;    
        }
        resolve();
    });
}