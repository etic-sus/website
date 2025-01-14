import React, { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { BotStructure, FeedbackStructure } from "../../types";
import { ThemeContext } from "../../contexts/ThemeContext";
import { borderColor } from "../../utils/theme/border";
import * as icon from "react-icons/bs";
import * as iconAI from "react-icons/ai";
import { UserContext } from "../../contexts/UserContext";
import api from "../../utils/api";
import { buttonColor } from "../../utils/theme/button";
import simo from "../../assets/images/simo.png";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/dist/locale/pt-br";

export const FeedbackCard: React.FC<{
    feedback: FeedbackStructure;
    bot: BotStructure;
    botid: string;
    isDeleted: boolean;
    setIsDeleted: (value: boolean) => void;
    updateFeedbacks: () => Promise<void>;
    developer: { id: string, avatar: string, username: string } | undefined;
}> = ({ feedback, botid, updateFeedbacks, setIsDeleted, isDeleted, bot, developer }): any => {
    const { color } = useContext(ThemeContext);
    const { user } = useContext(UserContext);

    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isEditReply, setIsEditReply] = useState<boolean>();
    const [editedContent, setEditedContent] = useState<string>(feedback?.content as string);
    const [rating, setRating] = useState<number>(feedback?.stars as number);
    const [submited, setSubmited] = useState<boolean>(false);
    const [reply, setReply] = useState<boolean>(false);
    const [replyContent, setReplyContent] = useState<string>();
    const [replySubmit, setReplySubmit] = useState<boolean>(false);

    const handleChangeEdit = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        setEditedContent(event.target.value);
    };

    const handleReplySend = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        setReplyContent(event.target.value);
    };

    const handleEditReplyFeedback = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        setSubmited(true);

        if (editedContent === feedback.content && rating === feedback.stars) {
            setSubmited(false);
            setIsEditReply(false);
            return;
        }

        event.preventDefault();

        await api.editFeedback(bot._id, {
            reply_message: {
                content: editedContent,
                posted_at: new Date(Date.now()).toISOString(),
                edited: true
            }
        });
        await updateFeedbacks();

        setSubmited(false);
        setIsEditReply(false);
    };

    const handleReplyFeedback = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setReplySubmit(true);

        await api.editFeedback(botid, {
            reply_message: {
                content: replyContent,
                posted_at: new Date(Date.now()).toISOString()
            }
        });

        await updateFeedbacks();
        setReplySubmit(false);
    };

    const handleSubmitEdit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        setSubmited(true);

        if (editedContent === feedback.content && rating === feedback.stars) {
            setSubmited(false);
            setIsEditReply(false);
            return;
        }

        event.preventDefault();

        await api.editFeedback(botid, {
            content: editedContent,
            stars: rating,
            edited: true,
            reply_message: {}
        });
        await updateFeedbacks();

        setSubmited(false);
        setIsEditReply(false);
    };

    return (
        <div className={`bg-neutral-900 rounded-lg p-1 text-white break-words border-2 ${borderColor[color]} h-full`}>
            <div className="flex flex-col p-3 gap-2 h-full">
                <div className="flex flex-row items-center justify w-full h-full">
                    <Link className="flex flex-row items-center" to={`/user/${feedback.author?.id}`}>
                        <img
                            src={`https://cdn.discordapp.com/avatars/${feedback?.author?.id}/${feedback?.author?.avatar}.png?size=2048`}
                            className="w-[30px] h-[30px] rounded-full"
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src = simo;
                            }}
                        />
                        <div className="flex gap-2 items-center min-w-[150px]">
                            <span className="p-1 ml-1">{feedback?.author?.username as string}</span>
                            <span className="text-neutral-500">{moment(feedback.posted_at).fromNow()}</span>
                        </div>
                    </Link>
                    {user?._id === feedback?.author?.id as string && (
                        <div className="flex gap-3 justify-end w-full">
                            <button disabled={isDeleted} onClick={async () => {
                                setIsDeleted(true);
                                await api.deleteFeedback(botid);
                                await updateFeedbacks();
                                setIsDeleted(false);
                            }} className="flex justify-end">
                                {!isDeleted ? <icon.BsTrash size={20} className="hover:fill-red-500 transition-colors duration-300" /> : <iconAI.AiOutlineLoading3Quarters fill="#fff" size={20} className="animate-spin" />}
                            </button>
                            <button onClick={() => {
                                setIsEdit(!isEdit);
                            }} className="flex justify-end">
                                <icon.BsPencilSquare size={20} className="hover:fill-amber-500 transition-colors duration-300" />
                            </button>
                        </div>
                    )}
                </div>
                {isEdit ? (
                    <form onSubmit={handleSubmitEdit} className="flex flex-col gap-3">
                        <div className={`bg-neutral-800 rounded-lg ${borderColor[color]} border-2 text-white w-full`}>
                            <textarea defaultValue={feedback.content} rows={4} onChange={handleChangeEdit} className="bg-transparent w-full focus:outline-none p-2" cols={22} required placeholder="Digite aqui" maxLength={500} />
                        </div>
                        <div className="flex flex-row gap-1">
                            {[1, 2, 3, 4, 5].map((star, index) => (
                                <span key={index} onClick={() => setRating(star)} className="cursor-pointer">
                                    {star <= rating ? <icon.BsFillStarFill size={30} fill="#fff" /> : <icon.BsStar size={30} fill="#fff" />}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-3 items-center justify-center">
                            <input disabled={submited} className={`disabled:cursor-default disabled:opacity-70 border-2 duration-300 transition-all cursor-pointer ${buttonColor[color]} p-3 rounded-lg w-full text-white`} type="submit" value="Enviar" />
                            {submited && <iconAI.AiOutlineLoading3Quarters fill="#fff" size={30} className="animate-spin" />}
                        </div>
                    </form>
                ) :
                    <div className="flex flex-col w-full justify-center items-start">
                        <div className="py-2">{feedback.content}{feedback?.edited && <span className="text-neutral-500"> (editado)</span>}</div>
                        {bot && (
                            bot.owner_id === user?._id && !reply && !("content" in feedback.reply_message) && <button onClick={() => setReply(true)} className="text-neutral-500">Replicar</button>
                        )}
                    </div>
                }
                {!isEdit && (
                    <div className="flex flex-row gap-1">
                        {Array(feedback.stars).fill(0).map((_, index) => (
                            <icon.BsStarFill key={index} />
                        ))}
                        {Array(5 - (feedback?.stars as number)).fill(0).map((_, index) => (
                            <icon.BsStar key={index} />
                        ))}
                    </div>
                )}
                {"content" in feedback.reply_message && user && (
                    isEditReply ? (
                        <form onSubmit={handleEditReplyFeedback} className="flex flex-row gap-3 w-full">
                            <div className="flex flex-col gap-3 h-42 items-center justify-center">
                                <img onError={async ({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src = (await import("../../assets/images/simo.png")).default;
                                }} className="rounded-full w-8" src={`https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png`} />
                                <div className="h-full py-3 bg-neutral-800 rounded-lg w-1" />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <div className={`bg-neutral-800 rounded-lg ${borderColor[color]} border-2 text-white w-full`}>
                                    <textarea defaultValue={feedback.reply_message.content} rows={4} onChange={handleChangeEdit} className="bg-transparent w-full focus:outline-none p-2" cols={22} required placeholder="Digite aqui" maxLength={500} />
                                </div>
                                <div className="flex gap-3 items-center justify-center">
                                    <input disabled={submited} className={`disabled:cursor-default disabled:hover:bg-none disabled:opacity-70 border-2 duration-300 transition-all cursor-pointer ${buttonColor[color]} p-3 rounded-lg w-full text-white`} type="submit" value="Enviar" />
                                    {submited && <iconAI.AiOutlineLoading3Quarters fill="#fff" size={30} className="animate-spin" />}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-row gap-2 items-start justify-center h-full my-1 border-l-neutral-800 border-l-[3px]">
                            <div className="flex items-start w-full flex-col mx-2 my-1">
                                <Link to={`/user/${developer?.id}`} className="flex items-center">
                                    <img
                                        src={`https://cdn.discordapp.com/avatars/${developer?.id}/${developer?.avatar}.png`}
                                        className="w-[30px] h-[30px] rounded-full"
                                        onError={({ currentTarget }) => {
                                            currentTarget.onerror = null;
                                            currentTarget.src = simo;
                                        }}
                                    />
                                    <div className="flex gap-2 items-center">
                                        <span className="p-1 ml-1">{developer?.username}</span>
                                        <span className="text-neutral-500">{moment(feedback.reply_message.posted_at).fromNow()}</span>
                                    </div>
                                </Link>
                                <div className="py-2">{feedback.reply_message.content}{feedback?.reply_message.edited && <span className="text-neutral-500"> (editado)</span>}</div>
                            </div>
                            {user?._id === bot.owner_id && (
                                <div className="flex gap-3 justify-end w-full">
                                    <button disabled={isDeleted} onClick={async () => {
                                        setIsDeleted(true);
                                        await api.editFeedback(bot._id, {
                                            reply_message: {}
                                        });
                                        await updateFeedbacks();
                                        setIsDeleted(false);
                                    }} className="flex justify-end">
                                        {!isDeleted ? <icon.BsTrash size={20} className="hover:fill-red-500 transition-colors duration-300" /> : <iconAI.AiOutlineLoading3Quarters fill="#fff" size={20} className="animate-spin" />}
                                    </button>
                                    <button onClick={() => {
                                        setIsEditReply(!isEditReply);
                                    }} className="flex justify-end">
                                        <icon.BsPencilSquare size={20} className="hover:fill-amber-500 transition-colors duration-300" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                {reply && user && (
                    <form onSubmit={handleReplyFeedback} className="flex flex-row gap-3 w-full h-full">
                        <div className="flex flex-col gap-3 h-42 items-center justify-center">
                            <img onError={async ({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src = (await import("../../assets/images/simo.png")).default;
                            }} className="rounded-full w-8" src={`https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png`} />
                            <div className="h-full py-3 bg-neutral-800 rounded-lg w-1" />
                        </div>
                        <div className="flex w-full flex-col gap-3">
                            <div className={`bg-neutral-800 rounded-lg ${borderColor[color]} border-2 text-white w-full`}>
                                <textarea rows={4} onChange={handleReplySend} className="bg-transparent w-full focus:outline-none p-2" cols={22} required placeholder="Digite aqui" maxLength={500} />
                            </div>
                            <div className="flex gap-3 items-center justify-center">
                                <input disabled={replySubmit} className={`disabled:cursor-default disabled:hover:bg-none disabled:opacity-70 border-2 duration-300 transition-all cursor-pointer ${buttonColor[color]} p-3 rounded-lg w-full text-white`} type="submit" value="Enviar" />
                                {replySubmit && <iconAI.AiOutlineLoading3Quarters fill="#fff" size={30} className="animate-spin" />}
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}