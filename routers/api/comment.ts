import bodyParser from "body-parser";
import { Router } from "express";
import z from "zod";
import prisma from "../../prisma.js";
import sess from "../../middleware/session.js";

const router = Router();

const commentSchema = z.object({
    content: z.string().min(1).max(255),
})

// router.get("/:postId", async (req, res) => {
//     const postId = req.query.postId;
//     const postIndex = req.query.postIndex||0;
//     const postSize = req.query.postSize||20;
//     const sort = req.query.sort ="acs"?"desc":"desc"; 
// })

router.post("/:postId", bodyParser.json(), sess, async (req, res) => {
    const userId = req.session.userId;
    const postId = Number(req.params.postId);
    if (userId === undefined) {
        res.status(403).send("需要登录")
        return undefined
    }
    const data = req.body;
   
    const result = commentSchema.safeParse(data)
    if (result.success) {
        const { content } = result.data;
        try {
            const created = await prisma.comment.create({
                data: {
                    content, 
                    postedBy: {connect: { id: userId }},
                    replyTo:{connect: { id: postId }}
                }
            })
            res.send(String(created.id))
        } catch (err) {
            console.log(String(err))
            res.status(403).send("无效的用户ID")
        }
    } else {
        res.status(400).send("Failed")
    }
});

// router.delete("/:commentId", sess, async (req, res) => {
//     const userId = req.session.userId;
//     if (userId === undefined) {
//         res.status(403).send("需要登录")
//         return undefined
//     }

//     const id = Number(req.params.commentId)

//     const count = await prisma.post.count({
//         where: { id, postedBy: { id: userId } }
//     })

//     if (count === 1) {
//         await prisma.post.update({
//             where: { id },
//             data: {
//                 deletedAt: new Date()
//             }
//         });
//         res.send("删除成功")
//         return undefined
//     }

//     res.status(403).send("没有权限")
// })

export default router;