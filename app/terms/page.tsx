export default function Terms() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <a href="/" className="text-blue-500 hover:underline text-sm mb-8 block">← Back to BloxAppeal</a>
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: March 2026</p>

        <div className="flex flex-col gap-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">1. Acceptance of Terms</h2>
            <p>By using BloxAppeal, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">2. Description of Service</h2>
            <p>BloxAppeal is an AI-powered tool that generates and submits Roblox ban appeal letters on behalf of users. We automate the legitimate appeal process available to every Roblox user through official public channels.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">3. No Guarantee of Results</h2>
            <p>BloxAppeal does not guarantee that any appeal will result in an account being unbanned. The final decision rests solely with Roblox Corporation. We make no warranties, express or implied, regarding the outcome of any appeal.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">4. User Responsibilities</h2>
            <p>You are responsible for providing accurate information. You must own or have authorization to appeal on behalf of the Roblox account in question. You agree not to use this service for fraudulent purposes.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">5. Email Access</h2>
            <p>By providing a Gmail App Password, you authorize BloxAppeal to read emails from Roblox support in your inbox solely for the purpose of monitoring appeal responses. We do not read, store, or share any other emails.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">6. Limitation of Liability</h2>
            <p>BloxAppeal is not liable for any damages arising from the use or inability to use this service. We are not affiliated with Roblox Corporation.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">7. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Continued use of the service constitutes acceptance of the updated terms.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
