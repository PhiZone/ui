import { GET } from "./utils";

export function getUserDetail(token?: string) {
	return GET("/user_detail/", token);
}
