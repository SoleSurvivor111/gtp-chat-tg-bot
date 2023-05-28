import { unlink } from "fs/promises";
export const removeFile = async (path) => {
    try {
        await unlink(path);
    }
    catch (e) {
        console.log("Error while removing file", e.message);
    }
};
//# sourceMappingURL=utils.js.map