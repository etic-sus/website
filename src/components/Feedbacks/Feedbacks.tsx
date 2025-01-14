import React, { useEffect, useState, useContext } from "react";
import { BotStructure, FeedbackStructure } from "../../types";
import api from "../../utils/api";
import { useParams } from "react-router-dom";
import { FeedbackCard } from "./FeedbackCard";
import * as icon from "react-icons/bs";
import * as iconAI from "react-icons/ai";
import { borderColor } from "../../utils/theme/border";
import { ThemeContext } from "../../contexts/ThemeContext";
import { UserContext } from "../../contexts/UserContext";
import { buttonColor } from "../../utils/theme/button";

export const Feedbacks: React.FC<{ botid: string, bot: BotStructure, dev: { id: string, avatar: string, username: string } | undefined }> = ({ botid, bot, dev }) => {
    const { color } = useContext(ThemeContext);
    const { user } = useContext(UserContext);

    const [isDeleted, setIsDeleted] = useState<boolean>(false);
    const [rating, setRating] = useState<number>(1);
    const [feedback, setFeedback] = useState<string>("");
    const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);

    const handleStarClick = (selectedRating: number) => {
        setRating(selectedRating);
    };

    const [feedbacks, setFeedbacks] = useState<FeedbackStructure[]>();
    const params = useParams();

    const [currentPage, setCurrentPage] = useState(1);

    const getBotFeedbacks = async (): Promise<void> => {
        setFeedbackLoading(true);
        const res = await api.getBotFeedbacks(params.botid as string);
        setFeedbacks(res.data);
        setFeedbackLoading(false);
    };

    useEffect(() => {
        getBotFeedbacks();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setSubmited(true);

        await api.postFeedback(rating, new Date().toISOString(), feedback, botid, user?._id as string).catch(() => {
            setFeedbackSent(true)
            setSubmited(false);
        });

        await getBotFeedbacks();

        setSubmited(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        event.preventDefault();
        setFeedback(event.target.value);
    };

    const indexLastItem: number = currentPage * 5;
    const indexFirstItem: number = indexLastItem - 5;
    const currentFeedbacks: FeedbackStructure[] | undefined = feedbacks?.slice(indexFirstItem, indexLastItem);

    return (
        <div className="w-screen max-w-[1500px] flex flex-col xl:ml-0 ml-[150px] mb-[30px] text-white gap-5 xl:items-center xl:justify-center">
            <div className="flex flex-col gap-2 w-[800px] xl:w-[90vw]">
                <span className="text-[26px] mb-2"><strong>Envie seu feedback!</strong></span>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className={`bg-neutral-800 rounded-lg ${borderColor[color]} border-2 text-white w-full`}>
                        <textarea rows={4} onChange={handleChange} className="bg-transparent w-full focus:outline-none p-2" cols={22} required placeholder="Digite aqui" maxLength={500} />
                    </div>
                    <div className="flex flex-row gap-1">
                        {[1, 2, 3, 4, 5].map((star, index) => (
                          <button key={index} type="button" onClick={() => handleStarClick(star)} className="cursor-pointer">
                              {star <= rating ? <icon.BsFillStarFill size={30} fill="#fff" /> : <icon.BsStar size={30} fill="#fff" />}
                          </button>
                        ))}
                    </div>
                    <div className="flex gap-3 items-center justify-center">
                        {user ? <input disabled={submited} className={`disabled:cursor-default disabled:opacity-70 border-2 duration-300 transition-all cursor-pointer ${buttonColor[color]} p-3 rounded-lg w-full text-white`} type="submit" value="Enviar" /> : <a href={import.meta.env.VITE_AUTH_LINK} className={`${buttonColor[color]} border-2 w-full p-3 duration-300 transition-all flex items-center justify-center rounded-lg`}>Fazer Login</a>}
                        {submited && <iconAI.AiOutlineLoading3Quarters fill="#fff" size={30} className="animate-spin" />}
                    </div>
                </form>
                {feedbackSent && (<div className="text-red-500">Você já enviou um feedback.</div>)}
            </div>
            <div className="w-[800px] xl:w-[90vw] flex flex-col gap-4">
                <span className="text-[26px] mb-2"><strong>Feedbacks</strong></span>
                {feedbackLoading ? (
                    <div className="flex flex-col gap-3">
                        {Array(3).fill(
                            <div className="bg-neutral-900 w-full h-[150px] rounded-lg border-2 border-neutral-800">
                                <div className="flex flex-col p-3 gap-2">
                                    <div className="flex flex-row items-center justify w-full">
                                        <div className="w-[40px] h-[40px] rounded-full animate-pulse bg-neutral-800"></div>
                                        <div className="flex gap-2 items-center justify-center">
                                            <div className="p-1 ml-1 w-[120px] h-[25px] animate-pulse bg-neutral-800 rounded-full"></div>
                                            <div className="bg-neutral-800 rounded-full w-[100px] h-[20px] animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-800 w-[70%] h-[40px] rounded-full animate-pulse"></div>
                                    <div className="bg-neutral-800 animate-pulse w-[130px] h-[20px] rounded-lg"></div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : currentFeedbacks && currentFeedbacks.length > 0 ? (
                    currentFeedbacks.sort((a, b) => new Date(b.posted_at as string).getTime() - new Date(a.posted_at as string).getTime()).map((feedback: FeedbackStructure, index: number) => (
                        <div key={index}>
                            <FeedbackCard developer={dev} bot={bot} feedback={feedback} botid={botid} updateFeedbacks={getBotFeedbacks} isDeleted={isDeleted} setIsDeleted={setIsDeleted} />
                        </div>
                    ))
                ) : (
                    <div>Sem feedbacks.</div>
                )}
            </div>
            <div className="flex w-[800px] xl:w-[90vw] xl:gap-4 gap-[300px] items-center justify-center">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${buttonColor[color]} flex-grow border-2 transition-colors duration-300 p-3 rounded-lg disabled:opacity-50`}
                >
                    Anterior
                </button>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!currentFeedbacks || currentFeedbacks.length < 5}
                    className={`${buttonColor[color]} flex-grow border-2 transition-colors duration-300 p-3 rounded-lg disabled:opacity-50`}
                >
                    Próxima
                </button>
            </div>
        </div>
    )
};
