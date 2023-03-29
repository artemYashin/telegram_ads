import { getData, setData } from "../Database/Database.js";

export type Article = {
    chatid: number;
    msgid: number;
}

export async function getArticle(): Promise<Article | false> {
    return new Promise<Article | false>(async (resolve) => {
        try {
            const article: Article = await getData('/article');
            resolve(article);
        } catch {
            resolve(false);
        }
    });
}

export async function saveArticle(chatid: number, msgid: number) {
    return new Promise<void>(async (resolve) => {
        await setData('/article', { chatid, msgid }, true);
        resolve();
    });
}