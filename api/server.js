const express = require("express");

const app = express();

const { PrismaClient } = require("@prisma/client");

// パスワードハッシュ化
const bcrypt = require("bcrypt");

// json web token jwtの機能を設定
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv");
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
const PORT = 8888;

// 新規ユーザーAPI
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  // 暗号化対応=bcryptを使ってハッシュ化する
  const hasedPass = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hasedPass,
    },
  });

  return res.json({ user });
});

// ログインAPI
app.post("/api/auth/login", async (req, res) => {
  // email, passwordをチェックするために取得します🤗
  const { email, password } = req.body;

  // whereはSQL等で出てくる条件を絞るという条件です🤗
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({
      error: "そのユーザーは存在しません",
    });
  }

  //compare bcryptのcompareは比較をしてチェックするおまじないです🤗
  const isPasswordCheck = await bcrypt.compare(password, user.password);

  if (!isPasswordCheck) {
    return res.status(401).json({
      error: "そのパスワードは間違っていますよ！",
    });
  }

  // token = チケットのイメージです🤗
  const token = jwt.sign({ id: user.id }, process.env.KEY, {
    expiresIn: "1d",
  });

  return res.json({ token });
});



// 新規チームAPI
app.post("/api/auth/team/register", async (req, res) => {
  const { teamName, category, image } = req.body;

  if (!teamName) {
    return res.status(400).json({
      message: "チーム名は必須項目です！",
    });
  }

  try {
 const team = await prisma.team.create({
      data: {
        teamName, 
        category,
        image,
      },
    });

    res.status(201).json(team);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});


// チーム情報取得用API
app.get("/api/auth/team", async (req, res) => {
  try {
    // チーム情報の取得処理
    const teamData = await prisma.team.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(teamData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});



// 新規プレイヤーAPI
app.post("/api/auth/player/register", async (req, res) => {
  const { No, name, position, image, category, height, teamId } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "No、名前、チームIDは必須項目です！",
    });
  }

  try {
    const player = await prisma.player.create({
      data: {
        No,
        name,
        position,
        image,
        category,
        height,
        teamId,
      },
    });

    res.status(201).json(player);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});

// プレイヤー情報取得用API
app.get("/api/auth/player", async (req, res) => {
  try {
    // プレイヤー情報の取得処理
    const playerData = await prisma.player.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(playerData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});


// 新規スコアAPI
app.post("/api/auth/score/register", async (req, res) => {
  const { gameId, quarter, team, kinds, player, point } = req.body;

  if (!quarter) {
    return res.status(400).json({
      message: "クォーターは必須項目です！",
    });
  }

  try {
    const score = await prisma.score.create({
      data: {
        gameId: {
          connect: {
            id: parseInt(gameId),
          },
        },
        quarter,
        team: {
          connect: {
            id: parseInt(team),
          },
        },
        kinds,
        player: {
          connect: {
            id: parseInt(player),
          },
        },
        point,
      },
    });

    res.status(201).json(score);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});

// スコア情報取得用API
app.get("/api/auth/score", async (req, res) => {
  try {
    // スコア情報の取得処理
    const scoreData = await prisma.score.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(scoreData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});


// 新規ゲームAPI
app.post("/api/auth/game/register", async (req, res) => {
  const { teamA, teamB, } = req.body;

  if (!teamA || !teamB) {
    return res.status(400).json({
      message: "チームAとチームBは必須項目です！",
    });
  }

  try {
    const game = await prisma.game.create({
      data: {
        teamA: {
          connect: {
            id: parseInt(teamA),
          },
        },
        teamB: {
          connect: {
            id: parseInt(teamB),
          },
        },
      },
    });

    res.status(201).json(game);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});

// ゲーム情報取得用API
app.get("/api/auth/game", async (req, res) => {
  try {
    // ゲーム情報の取得処理
    const gameData = await prisma.game.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(gameData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});




// // 投稿用API
// app.post("/api/post", async (req, res) => {
//   const { content } = req.body;

//   if (!content) {
//     return res.json(400).json({
//       message: "投稿内容がありません！",
//     });
//   }

//   try {
//     // 登録の処理を記述していく🤗
//     const newPost = await prisma.post.create({
//       data: {
//         content,
//         authorId: 1, //MEMO: 最後に修正します🤗
//       },
//       include: {
//         author: true,
//       },
//     });
//     res.status(201).json(newPost);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "サーバーエラーです！項目がおかしい、何か見直してください！",
//     });
//   }
// });

// // 取得用API
// app.get("/api/get_post", async (req, res) => {
//   try {
//     // 取得の処理を記述していく🤗
//     const postData = await prisma.post.findMany({
//       take: 10,
//       orderBy: { createdAt: "desc" },
//       include: {
//         author: true,
//       },
//     });
//     res.status(201).json(postData);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "サーバーエラーです！項目がおかしい、何か見直してください！",
//     });
//   }
// });





  


app.listen(PORT, () => console.log("server start!!!"));