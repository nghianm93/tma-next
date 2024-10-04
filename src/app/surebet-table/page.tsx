'use client';

import React, { useState, useEffect } from "react";
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaSync, FaCopy } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './styles.css';
import {
    on,
    postEvent,
} from '@telegram-apps/bridge';
import { Section } from '@telegram-apps/telegram-ui';


// Định nghĩa kiểu dữ liệu cho surebet
type Surebet = {
    event: string;
    bookmaker1: string;
    odds1: number;
    bookmaker2: string;
    odds2: number;
    profitPercentage: number;
    sportsType: string;
};

const SurebetTable: React.FC = () => {
    const [surebets, setSurebets] = useState<Surebet[]>([]);
    const [sortColumn, setSortColumn] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [filters, setFilters] = useState({
        sportsType: "",
        profitPercentage: "",
        bookmaker: "",
    });
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const off = on('back_button_pressed', () => {
            // Quay lại trang trước
            window.history.back();
            console.log('back button pressed')

            // Ẩn nút Back sau khi quay lại
            postEvent('web_app_setup_back_button', { is_visible: false });
        });

        // Cleanup listener khi component bị unmount
        return () => {
            off();
        };
    }, []);

    useEffect(() => {
        fetchSurebets();
        const interval = setInterval(fetchSurebets, 30000); // Auto-refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchSurebets = async () => {
        try {
            setLoading(true);
            // Giả lập gọi API
            const response = await new Promise<Surebet[]>((resolve) =>
                setTimeout(() => resolve(mockSurebets), 1000)
            );
            setSurebets(response);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch surebets. Please try again later.");
            setLoading(false);
        }
    };

    const handleSort = (column: string) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const handleFilter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const filteredAndSortedSurebets = surebets
        .filter((surebet) => {
            return (
                (filters.sportsType === "" ||
                    surebet.sportsType === filters.sportsType) &&
                (filters.profitPercentage === "" ||
                    surebet.profitPercentage >= parseFloat(filters.profitPercentage)) &&
                (filters.bookmaker === "" ||
                    surebet.bookmaker1.toLowerCase().includes(filters.bookmaker.toLowerCase()) ||
                    surebet.bookmaker2.toLowerCase().includes(filters.bookmaker.toLowerCase())) &&
                (searchTerm === "" ||
                    surebet.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    surebet.bookmaker1.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    surebet.bookmaker2.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        })
        .sort((a, b) => {
            if (sortColumn) {
                const aValue = a[sortColumn as keyof Surebet];
                const bValue = b[sortColumn as keyof Surebet];
                if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
                if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            }
            return 0;
        });

    const renderSortIcon = (column: string) => {
        if (column === sortColumn) {
            return sortDirection === "asc" ? (
                <FaSortUp className="ml-1 inline" />
            ) : (
                <FaSortDown className="ml-1 inline" />
            );
        }
        return <FaSort className="ml-1 inline text-gray-400" />;
    };

    console.log(filteredAndSortedSurebets)

    return (
        <Section
            header='Features'
            footer='You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects'
        >
            <div className="container">
                <h1 className="text-3xl mb-6 text-center">Surebet Table</h1>

                {/* Thêm class 'filter-section' vào phần này */}
                <div className="mb-4 flex items-center justify-between gap-4 filter-section">
                    <div className="flex items-center gap-4">
                        <select
                            name="sportsType"
                            value={filters.sportsType}
                            onChange={handleFilter}
                            className="p-2 border rounded"
                        >
                            <option value="">All Sports</option>
                            <option value="Football">Football</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Tennis">Tennis</option>
                        </select>
                        <input
                            type="number"
                            name="profitPercentage"
                            value={filters.profitPercentage}
                            onChange={handleFilter}
                            placeholder="Min Profit %"
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="bookmaker"
                            value={filters.bookmaker}
                            onChange={handleFilter}
                            placeholder="Bookmaker"
                            className="p-2 border rounded"
                        />
                    </div>

                    {/* Phần tìm kiếm */}
                    <div className="flex items-center">
                        <FaSearch className="mr-2 text-gray-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search events or bookmakers"
                            className="p-2 border rounded"
                        />
                    </div>
                </div>

                {/* Phần loading/error/bảng */}
                {loading ? (
                    <div className="text-center">
                        <FaSync className="animate-spin text-4xl text-blue-500 mx-auto" />
                        <p className="mt-2">Loading surebets...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table border-collapse table-auto">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 cursor-pointer" onClick={() => handleSort("event")}>
                                    Event {renderSortIcon("event")}
                                </th>
                                <th className="p-2 cursor-pointer" onClick={() => handleSort("bookmaker1")}>
                                    Bookmaker 1 {renderSortIcon("bookmaker1")}
                                </th>
                                <th className="p-2 cursor-pointer" onClick={() => handleSort("odds1")}>
                                    Odds 1 {renderSortIcon("odds1")}
                                </th>
                                <th className="p-2 cursor-pointer" onClick={() => handleSort("bookmaker2")}>
                                    Bookmaker 2 {renderSortIcon("bookmaker2")}
                                </th>
                                <th className="p-2 cursor-pointer" onClick={() => handleSort("odds2")}>
                                    Odds 2 {renderSortIcon("odds2")}
                                </th>
                                <th className="p-2 cursor-pointer" onClick={() => handleSort("profitPercentage")}>
                                    Profit % {renderSortIcon("profitPercentage")}
                                </th>
                                <th className="p-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAndSortedSurebets.map((surebet, index) => (
                                <tr
                                    key={index}
                                    className={`border-b ${surebet.profitPercentage > 5 ? "bg-green-100" : ""}`}
                                >
                                    <td className="p-2">{surebet.event}</td>
                                    <td className="p-2">{surebet.bookmaker1}</td>
                                    <td className="p-2">{surebet.odds1.toFixed(2)}</td>
                                    <td className="p-2">{surebet.bookmaker2}</td>
                                    <td className="p-2">{surebet.odds2.toFixed(2)}</td>
                                    <td className="p-2">{surebet.profitPercentage.toFixed(2)}%</td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => handleCopy(JSON.stringify(surebet))}
                                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                        >
                                            <FaCopy />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
        </Section>


    );
};

// Mock data for demonstration
const mockSurebets: Surebet[] = [
    {
        event: "Team A vs Team B",
        bookmaker1: "Bet365",
        odds1: 2.1,
        bookmaker2: "Betway",
        odds2: 1.95,
        profitPercentage: 3.5,
        sportsType: "Football"
    },
    {
        event: "Player X vs Player Y",
        bookmaker1: "Unibet",
        odds1: 1.8,
        bookmaker2: "888sport",
        odds2: 2.2,
        profitPercentage: 6.2,
        sportsType: "Tennis"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    },
    {
        event: "Team C vs Team D",
        bookmaker1: "William Hill",
        odds1: 1.65,
        bookmaker2: "Ladbrokes",
        odds2: 2.4,
        profitPercentage: 4.8,
        sportsType: "Basketball"
    }
];

export default SurebetTable;
