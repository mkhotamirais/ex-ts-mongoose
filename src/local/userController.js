import fs from "fs";

const data = {
  users: JSON.parse(fs.readFileSync(new URL("./user.json", import.meta.url))),
  setUsers(data) {
    this.users = data;
  },
};

export const getUsers = async (req, res) => {
  const result = data.users
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((user) => {
      const { username, email, role } = user;
      return { username, email, role };
    });
  res.status(200).json(result);
};
