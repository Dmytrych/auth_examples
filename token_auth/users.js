export function getUserById() {
    const getUserGetOptions = (authorization, userId) => ({
        method: "GET",
        url: `${process.env.OAUTH_URL}/api/v2/users/${userId}`,
        headers: {
            Authorization: authorization,
        },
    });
}
