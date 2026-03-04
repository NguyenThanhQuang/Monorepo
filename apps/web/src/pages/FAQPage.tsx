import { useState, useMemo } from "react";
import {
  ArrowLeft,
  HelpCircle,
  Search,
  ChevronDown,
  Ticket,
  CreditCard,
  MapPin,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function FAQPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = [
    { id: "all", name: t("allCategories"), icon: HelpCircle },
    { id: "booking", name: t("bookingCategory"), icon: Ticket },
    { id: "payment", name: t("paymentCategory"), icon: CreditCard },
    { id: "trip", name: t("tripCategory"), icon: MapPin },
    { id: "support", name: t("supportCategory"), icon: Phone },
  ];

  const faqs = [
    { id: "1", category: "booking", question: t("faq1Q"), answer: t("faq1A") },
    { id: "2", category: "booking", question: t("faq2Q"), answer: t("faq2A") },
    { id: "3", category: "booking", question: t("faq3Q"), answer: t("faq3A") },
    { id: "4", category: "payment", question: t("faq4Q"), answer: t("faq4A") },
    { id: "5", category: "payment", question: t("faq5Q"), answer: t("faq5A") },
    { id: "6", category: "payment", question: t("faq6Q"), answer: t("faq6A") },
    { id: "7", category: "trip", question: t("faq7Q"), answer: t("faq7A") },
    { id: "8", category: "trip", question: t("faq8Q"), answer: t("faq8A") },
    { id: "9", category: "trip", question: t("faq9Q"), answer: t("faq9A") },
    {
      id: "10",
      category: "support",
      question: t("faq10Q"),
      answer: t("faq10A"),
    },
    {
      id: "11",
      category: "support",
      question: t("faq11Q"),
      answer: t("faq11A"),
    },
    {
      id: "12",
      category: "support",
      question: t("faq12Q"),
      answer: t("faq12A"),
    },
  ];

  // Logic lọc
  const filtered = useMemo(
    () =>
      faqs.filter(
        (f) =>
          (category === "all" || f.category === category) &&
          (f.question.toLowerCase().includes(search.toLowerCase()) ||
            f.answer.toLowerCase().includes(search.toLowerCase())),
      ),
    [faqs, category, search],
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* HEADER STICKY */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("back")}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* TITLE */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-blue-600 to-teal-500 rounded-3xl mb-6 shadow-lg shadow-blue-500/30">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t("faqTitle")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t("faqSubtitle")}
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchFAQ")}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg text-gray-900 dark:text-white shadow-sm transition-all"
          />
        </div>

        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all font-medium ${
                  isActive
                    ? "bg-linear-to-r from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/30 transform scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((faq) => (
              <div
                key={faq.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <button
                  onClick={() =>
                    setExpanded(expanded === faq.id ? null : faq.id)
                  }
                  className="w-full flex justify-between items-center p-6 text-left"
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 transition-transform duration-300 shrink-0 ${
                      expanded === faq.id ? "rotate-180 text-blue-500" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    expanded === faq.id
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg text-gray-500 dark:text-gray-400">
                {t("noApplicationsFound") || "Không tìm thấy câu hỏi phù hợp"}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {t("tryChangeFilter") || "Thử thay đổi từ khóa tìm kiếm"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
