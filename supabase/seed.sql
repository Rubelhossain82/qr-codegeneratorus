-- Insert demo advertisements
INSERT INTO public.advertisements (
  title, 
  description, 
  image_url, 
  link_url, 
  position, 
  is_active,
  start_date,
  end_date
) VALUES 
(
  'Premium QR Generator',
  'Upgrade to premium for unlimited QR codes and advanced features',
  'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Premium+QR',
  '/pricing',
  'sidebar',
  true,
  NOW(),
  NOW() + INTERVAL '30 days'
),
(
  'Code Snippet Library',
  'Explore thousands of code snippets from our community',
  'https://via.placeholder.com/728x90/10B981/FFFFFF?text=Code+Library',
  '/snippets',
  'header',
  true,
  NOW(),
  NOW() + INTERVAL '60 days'
),
(
  'Developer Tools',
  'Complete toolkit for modern web development',
  'https://via.placeholder.com/300x250/F59E0B/FFFFFF?text=Dev+Tools',
  '/tools',
  'content',
  true,
  NOW(),
  NOW() + INTERVAL '45 days'
);

-- Insert sample code snippets
INSERT INTO public.code_snippets (
  title,
  language,
  code,
  description,
  is_public,
  tags
) VALUES 
(
  'React useState Hook Example',
  'javascript',
  'import React, { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Counter;',
  'Simple React counter component using useState hook',
  true,
  ARRAY['react', 'hooks', 'javascript', 'frontend']
),
(
  'CSS Flexbox Center Layout',
  'css',
  '.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}',
  'Perfect center alignment using CSS Flexbox',
  true,
  ARRAY['css', 'flexbox', 'layout', 'centering']
),
(
  'Python List Comprehension',
  'python',
  '# Basic list comprehension
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(squares)  # [1, 4, 9, 16, 25]

# Conditional list comprehension
even_squares = [x**2 for x in numbers if x % 2 == 0]
print(even_squares)  # [4, 16]

# Nested list comprehension
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [item for row in matrix for item in row]
print(flattened)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]',
  'Python list comprehension examples with conditions',
  true,
  ARRAY['python', 'list-comprehension', 'functional-programming']
),
(
  'JavaScript Async/Await API Call',
  'javascript',
  'async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(''Error fetching user data:'', error);
    throw error;
  }
}

// Usage
async function displayUser(userId) {
  try {
    const user = await fetchUserData(userId);
    console.log(''User:'', user);
  } catch (error) {
    console.log(''Failed to load user data'');
  }
}',
  'Modern JavaScript API call with async/await and error handling',
  true,
  ARRAY['javascript', 'async-await', 'api', 'fetch', 'error-handling']
),
(
  'SQL Query with Joins',
  'sql',
  'SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= ''2024-01-01''
GROUP BY u.id, u.first_name, u.last_name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 10;',
  'SQL query to find top customers with order statistics',
  true,
  ARRAY['sql', 'joins', 'aggregation', 'database']
);

-- Insert sample visitor data (for demo purposes)
INSERT INTO public.visitors (
  ip_address,
  user_agent,
  country,
  city,
  page_visited,
  referrer,
  session_id,
  visited_at
) VALUES 
(
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Bangladesh',
  'Dhaka',
  '/',
  'https://google.com',
  'sess_' || gen_random_uuid(),
  NOW() - INTERVAL '1 hour'
),
(
  '192.168.1.101',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Bangladesh',
  'Chittagong',
  '/qr-generator',
  'https://facebook.com',
  'sess_' || gen_random_uuid(),
  NOW() - INTERVAL '2 hours'
),
(
  '192.168.1.102',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
  'Bangladesh',
  'Sylhet',
  '/barcode-generator',
  'direct',
  'sess_' || gen_random_uuid(),
  NOW() - INTERVAL '3 hours'
),
(
  '192.168.1.103',
  'Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
  'Bangladesh',
  'Rajshahi',
  '/code-snippets',
  'https://twitter.com',
  'sess_' || gen_random_uuid(),
  NOW() - INTERVAL '4 hours'
),
(
  '192.168.1.104',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
  'Bangladesh',
  'Khulna',
  '/admin/dashboard',
  'https://linkedin.com',
  'sess_' || gen_random_uuid(),
  NOW() - INTERVAL '5 hours'
);

-- Update advertisement impression counts
UPDATE public.advertisements 
SET impression_count = FLOOR(RANDOM() * 1000) + 100,
    click_count = FLOOR(RANDOM() * 50) + 10
WHERE is_active = true;
