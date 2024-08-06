function createBanKeyboard(userId, username) {
  return {
    inline_keyboard: [
      [
        { text: "Ban", callback_data: `/ban ${userId} ${username}` },
        { text: "Permanent ban", callback_data: `/perban ${userId} ${username}` }
      ]
    ]
  };
}