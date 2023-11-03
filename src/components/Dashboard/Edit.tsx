import { AxiosResponse } from "axios";
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, Params } from "react-router-dom";
import { BotStructure, DiscordUser, UserStructure } from "../../types";
import api from '../../utils/api';
import { ThemeContext } from "../../contexts/ThemeContext";
import { Markdown } from "../../components/Markdown/Markdown";
import { borderAndBg } from "../../utils/theme/border&bg";
import { borderColor } from "../../utils/theme/border";
import * as icon from "react-icons/bs";
import { BotLoading } from "../Bot/BotLoading";
import { Button } from "../Mixed/Button";

export const DashboardEdit: React.FC = () => {
    const params: Params<string> = useParams<string>();
    const botid = params.botId as string;

    const { color } = useContext(ThemeContext);

    const [devs, setDevs] = useState<UserStructure[]>([]);
    const [preview, setPreview] = useState<boolean>(false);
    const [bot, setBot] = useState<BotStructure>();
    const [editedBot, setEditedBot] = useState<{
        long_description: string | undefined;
        short_description: string | undefined;
        tags: string[] | undefined;
        support_server: string | undefined;
        source_code: string | undefined;
        website_url: string | undefined;
        prefixes: string[] | undefined;
    }>({
        long_description: bot?.long_description,
        short_description: bot?.short_description,
        tags: bot?.tags,
        support_server: bot?.support_server,
        source_code: bot?.source_code,
        website_url: bot?.website_url,
        prefixes: bot?.prefixes
    });

    const getBotInDB = async (): Promise<void> => {
        const res: AxiosResponse<BotStructure> = await api.getBotInfos(botid);
        const { owners } = res.data;

        for (let i = 0; i < owners.length; i++) {
            const res: AxiosResponse<DiscordUser> = await api.getDiscordUser(owners[i]);
            const { username, avatar, id } = res.data;
            setDevs(devs => [...devs, { username: username, avatar: avatar, id: id, signed: true }]);
        }

        return setBot(res.data);
    };

    useEffect(() => {
        getBotInDB();
    }, []);

    return bot ? (
        <section className="max-w-[1500px] w-screen">
            {!bot.approved && (
                <div className="fixed flex items-center justify-center backdrop-blur-sm inset-0">
                    <div className="flex gap-3 items-center justify-center flex-col w-full h-[150px] border-2 rounded-lg bg-[#e8a60c] border-[#9e7514]">
                        <icon.BsClockFill size={35} />
                        <span className="text-lg text-center px-2">Bot {bot.name} está em análise, aguarde até que ela seja finalizada.</span>
                    </div>
                </div>
            )}
            <div className="flex flex-col items-center justify-center">
                <section className="flex items-center xl:flex-col justify-center w-full xl:mt-2 mt-[30px] text-white">
                    <div className={`bg-neutral-900 rounded-xl flex xl:flex-col xl:h-[320px] h-[120px] w-[95%] border-2 ${borderColor[color]} items-center justify-center`}>
                        <img
                            className="w-[100px] h-[100px] xl:my-2 rounded-full xl:float-none ml-2"
                            src={`https://cdn.discordapp.com/avatars/${bot._id}/${bot.avatar}.png?size=2048`}
                            alt={bot.name + "'s Avatar"}
                        />
                        <div className="flex flex-col w-full justify-center gap-2">
                            <div className="ml-6 xl:m-0 xl:my-1 text-white flex xl:flex-col xl:items-center flex-row gap-3 text-[26px]">
                                <strong>{bot.name}</strong>
                                <span className="text-[#797979] items-center flex text-[13px]">
                                    ( {bot._id} )
                                </span>
                            </div>
                            <div className="flex mx-6 xl:justify-center xl:m-1 flex-row gap-1">
                                {Array(5).fill(0).map(() => (
                                    <icon.BsStar />
                                ))}
                            </div>
                        </div>
                        <div className="flex w-full justify-end ">
                            <div className="flex gap-4 items-center justify-center xl:w-screen flex-row m-4">
                                <Link
                                    className="border-2 border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors duration-300 p-2 rounded-md w-[120px] text-center"
                                    to={`/vote/${bot._id}`}
                                >
                                    <span>Votar</span>
                                </Link>
                                <Link
                                    className="border-2 border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors duration-300 p-2 rounded-md w-[120px] text-center"
                                    to={`https://discord.com/api/oauth2/authorize?client_id=${bot._id}&permissions=70368744177655&scope=bot%20applications.commands`}
                                >
                                    <span>Adicionar</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section className={`w-[90%] mb-5 bg-neutral-900 border-2 ${borderColor[color]} border-t-0 rounded-t-none rounded-lg p-10 xl:p-3`}>
                    <div className="flex flex-row xl:flex-col">
                        <div className="w-[80%] h-full xl:w-full break-words xl:justify-center mr-4">
                            <Button action={() => setPreview(!preview)} name={preview ? "Ocultar preview" : "Ver preview"} clas="mb-2" />
                            {preview ? (
                                <Markdown markdown={bot.long_description} />
                            ) : (
                                <div className={`justify-center items-center flex outline-none bg-[#2c2c2c] w-full h-full rounded-xl p-3 border-[2px] transition-all duration-100 ${borderColor[color]} text-white`}>
                                    <textarea
                                        defaultValue={bot.long_description}
                                        maxLength={2048}
                                        rows={30}
                                        className="bg-transparent outline-none w-full scrollbar-thin disabled:opacity-50"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="w-[1px] bg-[#8b8b8b]" />
                        <hr className="xl:my-4 xl:w-full" />
                        <div className="flex flex-col gap-5 text-white px-5 w-[50%] xl:w-full">
                            <div className="w-full">
                                <div className="w-full">
                                    <h1 className="text-2xl text-center">{bot.owners.length > 1 ? "Developers" : "Developer"}</h1>
                                    <hr className="my-4 w-full" />
                                    <div className="grid grid-cols-2 gap-4">
                                        {devs.map((user: UserStructure) => (
                                            <Link to={`/users/${user.id}`} className="bg-neutral-900 border-2 border-neutral-700 p-2 rounded-lg flex flex-row flex-wrap justify-center xl:flex-col items-center gap-4 transition-colors duration-300 hover:bg-neutral-800">
                                                <img className="rounded-full h-[60px] w-[60px]" src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=2048`} alt={`${user.username}'s Avatar`} />
                                                <span className="text-center">{user.username}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl text-center">Informações</h1>
                                <hr className="my-4 w-full" />
                                <div className="flex flex-col w-full gap-3">
                                    <div>
                                        <strong className="text-lg">Prefixo </strong><span>{bot.prefixes.join(", ")}</span>
                                    </div>
                                    <div>
                                        <strong className="text-lg">Votos </strong><span>{bot.total_votes}</span>
                                    </div>
                                    <div>
                                        <div className="flex flex-row gap-3 flex-wrap">
                                            <strong className="text-lg">Tags</strong>
                                            {bot.tags.map(tag => (
                                                <div className={`${borderAndBg[color]} p-[6px] rounded-lg border-2`}>{tag}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <h1 className="text-2xl text-center">Links</h1>
                                    <hr className="my-1 w-full" />
                                    <div className="flex flex-col gap-3 flex-wrap">
                                        {bot?.support_server && (
                                            <Link to={bot?.support_server.includes("https://") ? bot?.support_server : "https://" + bot?.support_server} className="flex items-center gap-3 p-2">
                                                <icon.BsDiscord size={30} fill="#5662F6" />
                                                <span>Servidor de suporte</span>
                                            </Link>
                                        )}
                                        {bot?.source_code && (
                                            <Link to={bot?.source_code.includes("https://") ? bot?.source_code : "https://" + bot?.source_code} className="flex items-center gap-3 p-2">
                                                <icon.BsGithub size={30} />
                                                <span>Repositório</span>
                                            </Link>
                                        )}
                                        {bot?.website_url && (
                                            <Link to={bot?.website_url.includes("https://") ? bot?.website_url : "https://" + bot?.website_url} className="flex items-center gap-3 p-2">
                                                <icon.BsGlobe size={30} />
                                                <span>Website (<span className="text-blue-600">{bot?.website_url}</span>)</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div >
        </section >
    ) : (
        <BotLoading />
    );
};