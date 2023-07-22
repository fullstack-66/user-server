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
    firstName: z.string().min(1, { message: "Missing firstname" }),
    lastName: z.string().min(1, { message: "Missing lastname" }),
    email: z.string().email({ message: "Invalid email" }),
    dateOfBirth: z
      .string()
      .min(1, { message: "Missing date of birth" })
      .refine((s) => z.coerce.date().safeParse(s).success, {
        message: "Invalid date of birth",
      })
      .refine((s) => new Date(s) < new Date(), {
        message: "Wrong calendar",
      }),
    password: z.string().min(4, { message: "Password too short" }),
    confirmPassword: z.string().min(1, { message: "Confirm password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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
