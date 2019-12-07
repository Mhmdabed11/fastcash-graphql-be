const Query = {
  user: (root, args, context, info) => {
    return {
      id: "123123",
      firstName: "mohammad",
      lastName: "abed",
      email: "mohammad@hotmail.com"
    };
  }
};

export default Query;
