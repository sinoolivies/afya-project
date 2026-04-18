import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoaderCircle, MessageCircle, X, Send, User, Phone, CalendarDays, MapPin, Sparkles } from 'lucide-react'
import { sendChatMessage } from './lib/api'

const STARTER_QUESTIONS = [
  'I have chest pain and need the nearest hospital',
  'Book me a doctor for tomorrow',
  'I am in Kigali and need a pediatric doctor',
]

const THINKING_STEPS = [
  'Reviewing symptoms',
  'Structuring details',
  'Matching nearby hospitals',
  'Finding the best doctor',
  'Checking available slots',
]

const SideChatBoard = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [patientProfile, setPatientProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: null,
  })
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! Tell me your symptoms, preferred specialty, or where you are in Rwanda and I will help find care.',
      sender: 'bot',
      time: 'Now',
    },
  ])

  useEffect(() => {
    const existingSessionId = window.localStorage.getItem('afyacare-session-id')
    if (existingSessionId) {
      setSessionId(existingSessionId)
      return
    }

    const generated = `afyacare-${crypto.randomUUID()}`
    window.localStorage.setItem('afyacare-session-id', generated)
    setSessionId(generated)
  }, [])

  const toggleChat = () => setIsOpen(!isOpen)

  const getUserLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      )
    })

  const buildAssistantSummary = (response) => {
    const extras = []

    if (response.suggested_hospital?.name) {
      extras.push(`Hospital: ${response.suggested_hospital.name}`)
    }

    const doctorName = response.suggested_doctor?.userId?.fullName
    if (doctorName) {
      extras.push(`Doctor: ${doctorName}`)
    }

    if (response.suggested_slot?.start) {
      extras.push(`Slot: ${new Date(response.suggested_slot.start).toLocaleString()}`)
    }

    if (response.appointment?._id) {
      extras.push(`Pending appointment: ${response.appointment._id}`)
    }

    if (response.missingFields?.length) {
      extras.push(`Still needed: ${response.missingFields.join(', ')}`)
    }

    return extras.length ? `${response.reply}\n\n${extras.join('\n')}` : response.reply
  }

  const handleQuickPrompt = (prompt) => {
    setInput(prompt)
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending || !sessionId) return

    const userMessage = {
      id: Date.now(),
      text: trimmed,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setIsSending(true)

    try {
      const location = await getUserLocation()
      const nextProfile = {
        ...patientProfile,
        location: location || patientProfile.location,
      }
      const response = await sendChatMessage({
        sessionId,
        message: trimmed,
        specialty: null,
        preferredDate: null,
        patient: {
          fullName: nextProfile.fullName || undefined,
          phone: nextProfile.phone || undefined,
          email: nextProfile.email || undefined,
          location: nextProfile.location,
        },
      })

      if (response.collectedPatient) {
        setPatientProfile((current) => ({
          ...current,
          ...response.collectedPatient,
          location: response.collectedPatient.location || current.location,
        }))
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          text: buildAssistantSummary(response),
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          meta: response,
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 2,
          text: error.message,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Toggle Button + "Chat with me" label */}
      <div className="relative flex items-center gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="relative bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-xl hidden md:block"
            >
              Chat with me
              {/* Triangle tip for the bubble */}
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleChat}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isOpen ? 'bg-gray-100 text-gray-800 rotate-90' : 'bg-brand-600 text-white hover:scale-110 active:scale-95'
          }`}
        >
          {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
      </div>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[400px] bg-white/90 backdrop-blur-xl shadow-2xl flex flex-col border-l border-brand-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-50 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center overflow-hidden border-2 border-brand-100">
                    <User size={24} className="text-brand-600" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight">AfyaCare Support</h3>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online & Ready</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <Phone size={18} />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf3,#f8fafc)] p-5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Sparkles size={16} />
                  <p className="text-xs font-semibold uppercase tracking-[0.25em]">Start Here</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  I can ask follow-up questions, find the best hospital match, and prepare a pending appointment for hospital approval.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {STARTER_QUESTIONS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none shadow-premium'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    {msg.meta?.appointment?._id && (
                      <div className="mt-3 space-y-2 rounded-xl border border-emerald-200 bg-white/80 p-3 text-slate-700">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          <CalendarDays size={14} />
                          Pending Review
                        </div>
                        <p className="text-xs">Appointment ID: {msg.meta.appointment._id}</p>
                        {msg.meta.suggested_hospital?.name && (
                          <p className="flex items-center gap-2 text-xs">
                            <MapPin size={14} />
                            {msg.meta.suggested_hospital.name}
                          </p>
                        )}
                      </div>
                    )}
                    <p className={`text-[10px] mt-1 opacity-70 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-slate-100 p-4 text-sm text-slate-800">
                    <div className="flex items-center gap-2">
                      <LoaderCircle size={16} className="animate-spin text-emerald-600" />
                      <p className="font-medium text-slate-900">AfyaCare is thinking</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      {THINKING_STEPS.map((step, index) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0.35, x: -4 }}
                          animate={{ opacity: [0.35, 1, 0.55], x: 0 }}
                          transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            delay: index * 0.18,
                          }}
                          className="flex items-center gap-2 text-xs text-slate-600"
                        >
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>{step}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Input Area */}
            <div className="p-6 bg-white/80 border-t border-brand-50 backdrop-blur-md mb-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Describe symptoms or ask for the nearest hospital..."
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleSend()
                      }
                    }}
                    className="w-full bg-slate-100 border-none rounded-2xl py-3 px-4 pr-12 text-sm focus:ring-2 focus:ring-brand-500/20 transition-all outline-none text-slate-800"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isSending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 transition-all shadow-sm disabled:opacity-60"
                  >
                    {isSending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SideChatBoard
