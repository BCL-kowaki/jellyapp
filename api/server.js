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
  const { username, email, phone, password } = req.body;

  // 暗号化対応=bcryptを使ってハッシュ化する
  const hasedPass = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      phone,
      password: hasedPass,
    },
  });

  return res.json({ user });
});

// 新規チームAPI
app.post("/api/auth/team/register", async (req, res) => {
  const { teamName, Affiliation } = req.body;

  const team = await prisma.team.create({
    data: {
      teamName, 
      Affiliation,
    },
  });

  return res.json({ team });
});

// 新規プレイヤーAPI
app.post("/api/auth/player/register", async (req, res) => {
  const { No, name, position, Affiliation, height, teamId, team, teamName } = req.body;

  // teamIdを整数に変換
  let parsedTeamId = parseInt(teamId);

  const player = await prisma.player.create({
    data: {
      No,
      name,
      position,
      Affiliation,
      height,
      team: {
        connect: {
          id: parsedTeamId
        }
      },
      teamName,
    },
  });

  return res.json({ player });
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

app.listen(PORT, () => console.log("server start!!!"));