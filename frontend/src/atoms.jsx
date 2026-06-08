import { atom } from "jotai"
export const signupAtom = atom({
    firstName: "",
    lastName: "",
    username: "",
    password: ""
})


export const signinAtom = atom({
    username: "",
    password: ""
})

