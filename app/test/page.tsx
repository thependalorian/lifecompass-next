// app/test/page.tsx
export default function TestPage() {
  return (
    <div className="min-h-screen bg-om-green p-8">
      <h1 className="text-4xl font-bold text-white mb-4">CSS Test Page</h1>

      {/* Test Tailwind */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <p className="text-om-navy">Tailwind is working!</p>
      </div>

      {/* Test Custom Classes */}
      <button className="btn-om-primary mr-4">Custom Button</button>
      <button className="btn-om-secondary">Secondary Button</button>

      {/* Test DaisyUI */}
      <div className="card bg-base-100 shadow-xl mt-4 w-96">
        <div className="card-body">
          <h2 className="card-title">DaisyUI Card</h2>
          <p>If you see this styled, DaisyUI works!</p>
        </div>
      </div>

      {/* Test Badges */}
      <div className="mt-4 space-x-2">
        <span className="badge-om-active">Active</span>
        <span className="badge-om-pending">Pending</span>
        <span className="badge-om-inactive">Inactive</span>
      </div>

      {/* Test Input */}
      <div className="mt-4">
        <input type="text" placeholder="Test input" className="input-om" />
      </div>

      {/* Test Gradient Text */}
      <div className="mt-4">
        <p className="text-gradient-om text-xl font-bold">Gradient Text Test</p>
      </div>
    </div>
  );
}
