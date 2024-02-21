-- Este trigger evita que se inserten registros en la tabla HacenMatch 
-- donde idUsuario y idUsuario2 tengan el mismo valor.
CREATE TRIGGER evitaUsuariosIguales
BEFORE INSERT ON HacenMatch
FOR EACH ROW
BEGIN

    IF NEW.idUsuario = NEW.idUsuario2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se pueden insertar usuarios iguales en la tabla HacenMatch';
    END IF;
END;
//


-- Este trigger evita que se actualicen registros en la tabla HacenMatch 
-- para que idUsuario y idUsuario2 no tengan el mismo valor.
CREATE TRIGGER evitaUsuariosIgualesUpdate
BEFORE UPDATE ON HacenMatch
FOR EACH ROW
BEGIN

    IF NEW.idUsuario = OLD.idUsuario2 OR NEW.idUsuario2 = OLD.idUsuario THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se pueden actualizar usuarios iguales en la tabla HacenMatch';
    END IF;
END;
//

