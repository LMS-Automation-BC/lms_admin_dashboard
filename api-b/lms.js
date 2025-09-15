export default async function handler(req, res) {
  const { userId } = req.query;

  try {
    const externalRes = await fetch(`https://brookescollege.neolms.com/api/v3/users/${userId}?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67`);
    const data = await externalRes.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
}
