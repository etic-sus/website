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

export const TeamComponent: React.FC = () => {
    const params: Params = useParams<string>();
    const teamID: string = params.teamId as string;
    const [team, setTeam] = useState<Team>();
    const [teamBot, setTeamBot] = useState<BotStructure | null>(null);
    const [teamMembers, setTeamMembers] = useState<{ avatar: string; id: string; username: string, owner: boolean }[]>([]);

    const { color } = useContext(ThemeContext);

    const getTeam = async (): Promise<void> => {
        const { data: { members, bot_id }, data } = await api.getTeam(teamID);

        const ownersToAdd: { avatar: string; id: string; username: string, owner: boolean }[] = [];

        if (members) {
            for (const member of members) {
                const { data: { avatar, id, username } } = await api.getDiscordUser(member.id);
                ownersToAdd.push({ avatar, id, username, owner: !!members.find(a => a.owner && a.id === member.id) });
            }
        }

        if (bot_id) {
            const botInfo = (await api.getBotInfos(bot_id)).data;
            setTeamBot(botInfo);
        }

        setTeam(data);
        setTeamMembers([...teamMembers, ...ownersToAdd]);
    };

    useEffect(() => {
        getTeam();
    }, [])

    return team && teamMembers ? (
        <main className="max-w-[1500px] flex justify-start">
            <section className="w-screen flex flex-row p-5 text-white items-start justify-start gap-10 xl:flex-col">
                <div className={`${borderColor[color]} border-2 w-[300px] p-5 xl:w-[90vw] rounded-lg bg-neutral-900 flex items-center justify-center flex-col`}>
                    <div>
                        <img onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = simo;
                        }}
                            className="rounded-full w-32" src={team.avatar_url} />
                    </div>
                    <hr className="w-[80%] my-6" />
                    <div className="flex flex-col text-center justify-center">
                        <strong>{team.name}</strong>
                        <span className="text-[#797979] items-center flex text-[13px] justify-center">
                            ( {team.id} )
                        </span>
                    </div>
                    <div className="flex w-full flex-col gap-3 py-3 px-5">
                        <span className="text-lg font-bold text-left">Membros</span>
                        <div className="flex flex-wrap w-full gap-2">
                            {teamMembers.map((member) => (
                                <Link to={`/user/${member.id}`}>
                                    {member.owner && <icon.BiSolidCrown fill="#FFD700" className="absolute ml-7 rotate-45"/>}
                                    <img
                                        className="rounded-full w-10"
                                        src={`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=2048`}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-start w-full flex-col gap-2">
                    <h1 className="text-[33px]">Time <strong>{team.name}</strong></h1>
                    {team?.description && <span>{team.description}</span>}
                    <hr className="w-full my-3" />
                    <section className="w-full">
                        {!teamBot ? (
                            <div className="text-center text-[22px]">Time {team.name} não tem bots para serem listados.</div>
                        ) : (
                            <div className="grid-cols-2 grid gap-8 text-white m-2 xl:grid-cols-1 xl:items-left xl:justify-left">
                                {<BotCard bot={teamBot} />}
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </main>
    ) : (
        <UserLoading />
    )
};