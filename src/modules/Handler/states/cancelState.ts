import { State, findUser, updateUserState } from "../../UserState/UserState.js";

export async function cancelState(chatid: number) {
    return new Promise<void>(async (resolve) => {
        const user = await findUser(chatid);
        user.state = State.MAIN_SCREEN;
        user.state_for = false;
        await updateUserState(user);
        resolve();
    });
}