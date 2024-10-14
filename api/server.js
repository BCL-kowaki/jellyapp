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
  const { gameId, teamId, quarter, kinds, playerId, point } = req.body;

  if (!quarter) {
    return res.status(400).json({
      message: "クォーターは必須項目です！",
    });
  }

  try {
    const score = await prisma.score.create({
      data: {
        game: {
          connect: {
            id: parseInt(gameId),
          },
        },
        team: {
          connect: {
            id: parseInt(teamId),
          },
        },
        quarter,
        kinds,
        player: {
          connect: {
            id: parseInt(playerId),
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
  const { date, teamAId, teamBId, } = req.body;

  if (!teamAId || !teamBId) {
    return res.status(400).json({
      message: "チームAとチームBは必須項目です！",
    });
  }

  try {
    const game = await prisma.game.create({
      data: {
        date,
        teamA: {
          connect: {
            id: parseInt(teamAId),
          },
        },
        teamB: {
          connect: {
            id: parseInt(teamBId),
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


// 新規出場区分API
app.post("/api/auth/join/register", async (req, res) => {
  const { date, gameId, playerId, join} = req.body;

  if (!join) {
    return res.status(400).json({
      message: "出場区分は必須項目です！",
    });
  }

  try {
    const join = await prisma.join.create({
      data: {
        date,
        gameId: {
          connect: {
            id: parseInt(gameId),
          },
        },
        playerId: {
          connect: {
            id: parseInt(playerId),
          },
        },
        join,
      },
    });

    res.status(201).json(join);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});

// 出場区分取得用API
app.get("/api/auth/join", async (req, res) => {
  try {
    // 出場区分の取得処理
    const joinData = await prisma.join.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(joinData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "サーバーエラーです！項目がおかしい、何か見直してください！",
    });
  }
});

app.listen(PORT, () => console.log("server start!!!"));