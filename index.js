require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3001;
const dayjs = require("dayjs");
const bodyParser = require("body-parser");
const { z } = require("zod");

app.use(bodyParser.json());
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const schema = z
  .object({
    firstName: z.string().min(1, { message: "Required" }),
    lastName: z.string().min(1, { message: "Required" }),
    email: z.string().email({ message: "Invalid email" }),
    dateOfBirth: z.string().min(1, { message: "Required" }),
    password: z
      .string()
      .min(4, { message: "Must be longer than 4 characters" }),
  })
  .refine(
    (data) => {
      return z.coerce.date().safeParse(data.dateOfBirth).success;
    },
    {
      message: "Plase input valid date",
      path: ["dateOfBirth"],
    }
  )
  .refine(
    (data) => {
      const nYear = new Date().getFullYear();
      const bYear = new Date(data.dateOfBirth).getFullYear();
      return nYear - bYear >= 18;
    },
    {
      message: "You must be 18 years old",
      path: ["dateOfBirth"],
    }
  );

const initData = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: dayjs("1980-01-01").format("YYYY-MM-DD"),
    email: "join_doe@example.com",
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Smith",
    dateOfBirth: dayjs("1975-07-26").format("YYYY-MM-DD"),
    email: "sarah_smith@example.com",
  },
];

let data = [...initData];

app.get("/", cors(corsOptions), (req, res) => {
  res.send("Hello World");
});

app.get("/users", cors(corsOptions), (req, res) => {
  res.send(data);
});

app.get("/users_wrong", cors(corsOptions), (req, res) => {
  const dataNew = data.map((d) => {
    const { firstName, lastName, dateOfBirth, ...rest } = d;
    return {
      ...rest,
      firstname: firstName,
      lastname: lastName,
      dateOfBirth: dayjs(dateOfBirth).add(543, "year").format("YYYY-MM-DD"),
    };
  });
  res.send(dataNew);
});

app.post("/users", cors(corsOptions), (req, res) => {
  const result = schema.safeParse(req.body);
  if (result.success) {
    const { password, ...rest } = req.body;
    const newData = { id: data.length + 1, ...rest };
    data = [newData, ...data];
    setTimeout(() => {
      return res.send({ status: "success" });
    }, 2000);
  } else {
    return res.status(400).send(JSON.stringify(result.error.issues));
  }
});

app.get("/reset", cors(corsOptions), (req, res) => {
  data = [...initData];
  res.send({ status: "success" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
