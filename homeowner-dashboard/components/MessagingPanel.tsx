
import { useState } from 'react';

interface MessagingPanelProps {
  jobId: number;
}

export default function MessagingPanel({ jobId: _jobId }: MessagingPanelProps) {
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: 1,
      sender: 'Elite Plumbing Solutions',
      avatar: 'EP',
      text: 'Good morning! I\'ve arrived and starting the initial assessment now.',
      time: '9:05 AM',
      isContractor: true
    },
    {
      id: 2,
      sender: 'You',
      avatar: 'JD',
      text: 'Great, thank you! Please let me know what you find.',
      time: '9:12 AM',
      isContractor: false
    },
    {
      id: 3,
      sender: 'Elite Plumbing Solutions',
      avatar: 'EP',
      text: 'The leak is at the base connection. I\'ve uploaded photos to the workflow. We\'ll need to replace the entire faucet unit. I can have the parts here tomorrow morning.',
      time: '9:45 AM',
      isContractor: true
    },
    {
      id: 4,
      sender: 'You',
      avatar: 'JD',
      text: 'That works for me. What time can you come tomorrow?',
      time: '10:02 AM',
      isContractor: false
    },
    {
      id: 5,
      sender: 'Elite Plumbing Solutions',
      avatar: 'EP',
      text: 'I can be there at 10 AM. The installation should take about 2-3 hours.',
      time: '10:15 AM',
      isContractor: true
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-[#F9F9FB]">
        <h3 className="text-lg font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Messages
        </h3>
        <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Chat with Elite Plumbing Solutions
        </p>
      </div>

      {/* Messages */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${!msg.isContractor ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
              msg.isContractor ? 'bg-[#2D2A74]' : 'bg-[#00B8A9]'
            }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
              {msg.avatar}
            </div>

            {/* Message */}
            <div className={`flex-1 ${!msg.isContractor ? 'text-right' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold text-[#333645] ${!msg.isContractor ? 'ml-auto' : ''}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {msg.sender}
                </span>
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {msg.time}
                </span>
              </div>
              <div className={`inline-block px-4 py-3 rounded-lg ${
                msg.isContractor 
                  ? 'bg-[#F9F9FB] text-[#333645]' 
                  : 'bg-[#00B8A9] text-white'
              }`}>
                <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {msg.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100 bg-[#F9F9FB]">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#00B8A9] focus:outline-none text-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button 
            onClick={handleSendMessage}
            className="px-6 py-3 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer flex items-center gap-2" 
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-send-plane-fill"></i>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
