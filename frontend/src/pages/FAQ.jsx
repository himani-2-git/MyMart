import React, { useState } from 'react';
import { ChevronDown, MessageCircleQuestion, Package, ShoppingCart, Sparkles } from 'lucide-react';

const S = { bg: '#0d0d14', card: '#1e1e1e', border: '#3e3f3e', muted: '#6b7280', text: '#e2e8f0', green: '#54c750' };

const faqData = [
  {
    category: "General Dashboard & Analytics",
    icon: <MessageCircleQuestion size={20} style={{ color: S.green }} />,
    questions: [
      {
        q: "How is Net Profit calculated on the Dashboard?",
        a: "Net profit is automatically calculated by subtracting your total recorded expenses and total cost of goods sold from your total gross revenue within the selected time period."
      },
      {
        q: "Can I export my dashboard data?",
        a: "Yes! Simply click the 'Export' button at the top right of the dashboard. This will generate a professionally formatted CSV file containing your key metrics, top categories, and sales trends."
      },
      {
        q: "How does the sales forecasting work?",
        a: "Our AI-powered forecasting system analyzes your historical sales data (from the past 30 days) combined with trends to project your expected revenue for the next 7 days."
      }
    ]
  },
  {
    category: "Point of Sale (POS)",
    icon: <ShoppingCart size={20} style={{ color: S.green }} />,
    questions: [
      {
        q: "Why can't I find some products in the POS screen?",
        a: "You can use the new category filter pills (like 'Beverages' or 'Snacks') directly under the search bar to narrow down items. Ensure the products have been added to your Inventory first."
      },
      {
        q: "Can I print receipts for my customers?",
        a: "Absolutely! After completing a checkout, a receipt modal appears. Clicking 'Print' formats the receipt perfectly for standard 80mm thermal printers. Your shop's contact number, configured in Settings, will print on the top."
      },
      {
        q: "Can I sell items that are out of stock?",
        a: "By default, items with 0 stock are faded out and cannot be added to the cart to prevent overselling. You must restock them in the Inventory tab first."
      }
    ]
  },
  {
    category: "Inventory Management",
    icon: <Package size={20} style={{ color: S.green }} />,
    questions: [
      {
        q: "How do I know when items are running low?",
        a: "Items with stock quantities below 10 display a yellow warning triangle in the Inventory table. The Dashboard also provides a summary of all low stock items."
      },
      {
        q: "Does the system track item expiration dates?",
        a: "Yes. When adding or editing a product, you can set an expiry date. Items nearing expiration (within 7 days) will display a red clock icon in your inventory list."
      },
      {
        q: "What is the fastest way to restock an existing item?",
        a: "In the Inventory screen, click the 'PackagePlus' (Restock) icon next to the relevant product in the table. This instantly adds to the current quantity without needing to edit the entire product profile."
      }
    ]
  },
  {
    category: "AI Chat Assistant",
    icon: <Sparkles size={20} style={{ color: S.green }} />,
    questions: [
      {
        q: "What kind of questions can I ask the AI?",
        a: "You can ask the AI Assistant anything about your store's live data! Try asking: 'What are my total sales today?', 'What is my best selling product?', or 'Do I have any low stock items?'"
      },
      {
        q: "Is the AI constantly updated with my sales?",
        a: "Yes! Every time you make a transaction or update inventory, the AI has real-time access to your database to give you accurate insights on the fly."
      },
      {
        q: "How do I hide the AI Chatbot?",
        a: "You can toggle the chatbot by clicking the floating green icon in the bottom right corner of any page. It will remain hidden until you click it again."
      }
    ]
  }
];

const FAQAccordion = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300" 
         style={{ backgroundColor: S.card, border: `1px solid ${isOpen ? S.green : S.border}` }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-black/20"
      >
        <span className="font-semibold text-[15px] text-white pr-8 leading-snug">{item.q}</span>
        <ChevronDown 
          size={20} 
          className="transition-transform duration-300 flex-shrink-0" 
          style={{ color: isOpen ? S.green : S.muted, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} 
        />
      </button>
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0 }}
      >
        <div className="p-5 pt-0 text-sm leading-relaxed" style={{ color: S.muted }}>
          {item.a}
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-sm" style={{ color: S.muted }}>
          Find quick answers about using the MyMart platform, managing inventory, and leveraging your AI assistant.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {faqData.map((category, index) => (
          <div key={index} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#54c75022' }}>
                {category.icon}
              </div>
              <h2 className="text-xl font-bold text-white">{category.category}</h2>
            </div>
            
            <div className="space-y-4">
              {category.questions.map((q, qIndex) => (
                <FAQAccordion key={qIndex} item={q} />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Support CTA */}
      <div className="mt-12 p-8 rounded-2xl flex flex-col items-center justify-center text-center border" 
           style={{ backgroundColor: S.card, borderColor: S.border }}>
        <h3 className="text-lg font-bold text-white mb-2">Still need help?</h3>
        <p className="text-sm mb-6" style={{ color: S.muted }}>Our support team is always ready to assist you.</p>
        <a href="mailto:himaniw21@gmail.com" 
           className="px-6 py-2.5 rounded-xl font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#54c75033]" 
           style={{ backgroundColor: S.green }}>
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default FAQ;
