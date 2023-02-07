export const load: import("./$types").LayoutServerLoad = async ({ locals }) => {
	return {
		backupUser: locals.user,
	};
};
