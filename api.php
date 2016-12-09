<?php

if(array_key_exists('q', $_GET)) {
	$conexión = new MongoClient("mongodb://grafos:paramore@localhost/grafos");
	$colección = $conexión->selectCollection('grafos', 'grafos');
	$action = $_GET['q'];
	header('Content-Type: application/json');
	switch ($action) {
		case 'guardar':
			$grafo = [
				'_id'      => $_POST['nombre'],
				'nombre'   => $_POST['nombre'],
				'vertices' => json_decode($_POST['vertices']),
                'aristas'  => json_decode($_POST['aristas'])
			];
			$colección->save($grafo);
			echo json_encode(['success' => true]);
			break;
		case 'abrir':
			$data = $colección->find(array("_id" => $_POST['nombre']));
			$resultado = $data->getNext();
			echo json_encode([
				'success'  => true,
				'nombre'   => $resultado['nombre'],
				'vertices' => $resultado['vertices'],
				'aristas'  => $resultado['aristas']
			]);
			break;
	}
} else {
	echo json_encode(['success' => false]);
}

?>