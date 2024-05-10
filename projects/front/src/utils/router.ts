
export const redirect = (hash: string) => {
    window.history.pushState(null, '', hash);
}