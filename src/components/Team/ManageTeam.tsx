import { FC, useContext, useEffect, useState } from "react";
import { DashboardUser } from "../Dashboard/User";
import { UserContext } from "../../contexts/UserContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import { Team, UserStructure } from "../../types";
import { borderColor } from "../../utils/theme/border";
import { SubmitHandler, useForm } from "react-hook-form";
import * as icon from "react-icons/ai";
import { Input } from "../Addbot/Input";
import { buttonColor } from "../../utils/theme/button";
import api from "../../utils/api";

export const ManageTeamComponent: FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<Team>();
    const { color } = useContext(ThemeContext);
    const { user } = useContext(UserContext);
    const [team, setTeam] = useState<Team | undefined>();
    const [submitedEdit, setSubmitedEdit] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const onSubmitEdit: SubmitHandler<Team> = async (data: Team): Promise<void> => {
        setSubmitedEdit(true);

        const { avatar_url, description, name } = data;

        const formData: Team = {
            avatar_url,
            description,
            name,
        };

        try {
            await api.patchTeam(team?.id as string, formData);
            setSuccess(true);
        } catch (error: any) {
            setSuccess(false);
            setSubmitedEdit(false);
            alert("Erro ao tentar dar patch em um time: " + JSON.stringify(error.response.data));
        }

        setSubmitedEdit(false);
    };

    const getUserTeams = async (): Promise<void> => {
        const req = (await api.getUserTeams()).data.find((team) => team.members?.map((member) => member.owner && member.id === user?.id));
        setTeam(req);
    };

    useEffect(() => {
        getUserTeams();
    }, []);

    return (
        <main className="max-w-[1500px] flex justify-center">
            <section className="w-screen flex flex-row p-5 text-white items-center justify-start gap-10 xl:flex-col h-full">
                <DashboardUser color={color} user={user as UserStructure} />
                <div className="flex items-center justify-start h-full w-full flex-col">
                    <h1 className="text-[33px] text-center">Bem vindo a dashboard, <strong>{user?.username}</strong></h1>
                    <hr className="w-full my-3" />
                    <div className="w-full">
                    </div>
                    <section className={`w-full bg-neutral-900 mt-2 border-2 flex-row ${borderColor[color]} rounded-lg p-4 items-center justify-center`}>
                        <div className="text-white xl:text-[26px] text-[40px] m-2 xl:m-0 xl:mt-2 w-full flex items-center justify-center">
                            <span className="text-white flex flex-row text-[26px] mx-10 my-3">
                                <h1 className="text-[#ffffff] xl:text-[28px] xl:mr-0 mr-2 font-bold">Editar time <strong>{team?.name}</strong></h1>
                            </span>
                        </div>
                        <form onSubmit={handleSubmit(onSubmitEdit)} className="gap-5 items-center justify-center pt-1 flex flex-col">
                            <div className="flex flex-col gap-3">
                                <Input errors={errors} name="name" defaultValue={team?.name} register={register} text="Digite o nome que o seu time irá receber" title="Nome" type="input" maxLength={15} minLength={3} placeholder="Mango Team" />
                                <Input errors={errors} name="avatar_url" defaultValue={team?.avatar_url} register={register} text="Coloque o link de imagem do avatar do seu time" title="Avatar em URL" inputType="url" type="input" placeholder="https://i.imgur.com/1DBO2wh.jpeg" />
                                <Input errors={errors} name="description" register={register} defaultValue={team?.description} text="Digite uma breve descrição sobre seu time" title="Descrição" optional type="input" placeholder="Meu time é um time legal e bonito..." maxLength={50} minLength={5} />
                            </div>
                            <div className="flex justify-center m-4 xl:m-0 xl:w-full xl:mb-4 items-center gap-3">
                                <input
                                    type="submit"
                                    value="Salvar alterações"
                                    disabled={submitedEdit}
                                    className={`disabled:cursor-default disabled:opacity-70 cursor-pointer transition-all duration-300 items-center border-2 w-[300px] rounded-xl h-[60px] text-white xl:w-full ${buttonColor[color]}`}
                                />
                                {submitedEdit && <icon.AiOutlineLoading3Quarters fill="#fff" size={30} className="animate-spin" />}
                            </div>
                        </form>
                    </section>
                </div>
            </section>
        </main>
    )
};