import React, { useState, useContext, useEffect } from "react";
import { Link, Params, useParams } from "react-router-dom";
import { BotStructure, Team } from "../../types";
import { ThemeContext } from "../../contexts/ThemeContext";
import { borderColor } from "../../utils/theme/border";
import { BotCard } from "../BotList/BotCard";
import simo from "../../assets/images/simo.png";
import api from "../../utils/api";
import * as icon from "react-icons/bi";
import { UserLoading } from "../User/UserLoading";
import { Button } from "../Mixed/Button";
import { UserContext } from "../../contexts/UserContext";
import { buttonColor } from "../../utils/theme/button";
import { DeleteTeam } from "./DeleteTeam";
import { Botloading } from "../BotList/Botloading";
import { CopyButton } from "../Mixed/Copy";
import { LeaveTeam } from "./LeaveTeam";
import moment from "moment";
import "moment/dist/locale/pt-br";

const TeamPermissions = {
    Administrator: 0,
    ReadOnly: 1,
    Owner: 2
}

export const TeamComponent: React.FC = () => {
    const params: Params = useParams<string>();
    const { user } = useContext(UserContext);
    const teamID: string = params.teamId as string;
    const [team, setTeam] = useState<Team>();
    const [deleteTeam, setDeleteTeam] = useState<boolean>(false);
    const [teamBots, setTeamBots] = useState<BotStructure[] | null>(null);
    const [leaveTeam, setLeaveTeam] = useState<boolean>(false);

    const { color } = useContext(ThemeContext);

    const getTeam = async () => {
        const { data } = await api.getTeam(teamID);

        setTeam(data);
    }

    const getTeamBots = async () => {
        const { status, data } = await api.getTeamBots(teamID);

        setTeamBots(status === 404 ? null : data);
    }

    useEffect(() => {
        getTeam();
        getTeamBots();
    }, []);

    return team ? (
        <main className="max-w-[1500px] flex justify-start">
            <section className="w-screen flex flex-row p-5 text-white items-start xl:items-center justify-start gap-10 xl:flex-col">
                <div className={`${borderColor[color]} border-2 w-[300px] p-5 xl:w-[90vw] rounded-lg bg-neutral-900 flex items-center justify-center flex-col`}>
                    <div>
                        <img onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = simo;
                        }}
                            className="rounded-full w-32 h-32 object-center" src={team.avatar_url} />
                    </div>
                    <hr className="w-[80%] my-6" />
                    <div className="flex gap-2 text-center justify-center">
                        <strong>{team.name}</strong>
                        <CopyButton name="ID" text={team.id as string} key={Math.random()}/>
                    </div>
                    <div className="flex w-full flex-col gap-3 py-3 px-5">
                        {team.members?.find((member) => member.permission === TeamPermissions.Owner && member.id === user?._id || member.permission === TeamPermissions.Administrator && member.id === user?._id) && (
                            <div className="flex flex-col gap-2">
                                <Button link to={"/team/manage/" + team.id} clas="w-full flex gap-3 items-center"><icon.BiWrench />Gerenciar</Button>
                                {team.members.find((member) => member.permission === TeamPermissions.Owner && member.id === user?._id) && (
                                    <button onClick={() => setDeleteTeam(true)} className={`flex items-center flex-row gap-3 p-3 w-full rounded-lg ${buttonColor["red"]} h-12 transition-colors duration-300 border-2`}>
                                        <icon.BiTrash />
                                        <span>Deletar</span>
                                    </button>
                                )}
                            </div>
                        )}
                        {team.members?.find((member) => member.id === user?._id && member.permission !== TeamPermissions.Owner) && (
                            <Button action={() => setLeaveTeam(true)} clas={`flex items-center gap-2 ${buttonColor["red"]}`}>
                                <icon.BiArrowBack/>
                                <span>Sair do time</span>
                            </Button>
                        )}
                        <span className="text-lg font-bold text-left">Membros</span>
                        <div className="flex flex-wrap w-full gap-2">
                            {team.members?.map((member, index) => (
                                <Link className="relative" key={index} to={`/user/${member.id}`}>
                                    {member.permission === TeamPermissions.Owner && <icon.BiSolidCrown fill="#FFD700" className="absolute ml-7 rotate-45" />}
                                    <img
                                        onError={async ({ currentTarget }) => {
                                            currentTarget.onerror = null;
                                            currentTarget.src = (await import("../../assets/images/simo.png")).default;
                                        }}
                                        className="rounded-full w-10"
                                        src={`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=2048`}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <span className="text-neutral-500">Criado {moment(team.created_at).fromNow()} atrás</span>
                </div>
                <div className="flex items-start w-full flex-col gap-2">
                    <h1 className="text-[33px]">Time <strong>{team.name}</strong></h1>
                    {team?.description && <span>{team.description}</span>}
                    <hr className="w-full my-3" />
                    <section className="w-full flex xl:items-center xl:justify-center">
                        {teamBots || team.bots_id?.length === 0 ? (
                            <div className="grid-cols-2 grid gap-8 text-white m-2 xl:grid-cols-1 xl:place-items-center xl:w-[95vw]">
                                {team.bots_id?.length === 0 ? (
                                    <span className="text-lg">Esse time não tem bots.</span>
                                ) : teamBots?.map((bot, index) => <BotCard bot={bot} key={index} />)}
                            </div>
                        ) : (
                            <Botloading fills={2} />
                        )}
                    </section>
                </div>
            </section>
            <div className={`transiton-opacity duration-300 ${deleteTeam ? "visible opacity-100" : "invisible opacity-0"}`}>
                {deleteTeam && <DeleteTeam deletedTeam={deleteTeam} setDeletedTeam={setDeleteTeam} team={team} />}
            </div>
            <div className={`transiton-opacity duration-300 ${leaveTeam ? "visible opacity-100" : "invisible opacity-0"}`}>
                {leaveTeam && <LeaveTeam menu={leaveTeam} setMenu={setLeaveTeam} team={team}/>}
            </div>
        </main>
    ) : (
        <UserLoading />
    )
};